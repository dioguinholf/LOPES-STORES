#include "../include/routes.h"
#include "../include/db.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <openssl/sha.h>
#include <fcntl.h>
#include <unistd.h>

static void send_json(struct mg_connection *c, int status, const char *body) {
    mg_http_reply(c, status,
        "Content-Type: application/json\r\n"
        "Access-Control-Allow-Origin: *\r\n",
        "%s", body);
}

static void send_error(struct mg_connection *c, int status, const char *msg) {
    char buf[256];
    snprintf(buf, sizeof(buf), "{\"erro\":\"%s\"}", msg);
    send_json(c, status, buf);
}

static int json_get_string(const char *json, const char *key, char *out, size_t out_len) {
    char search[64];
    snprintf(search, sizeof(search), "\"%s\":", key);
    const char *p = strstr(json, search);
    if (!p) return 0;
    p += strlen(search);
    while (*p == ' ') p++;
    if (*p == '"') {
        p++;
        size_t i = 0;
        while (*p && *p != '"' && i < out_len - 1) out[i++] = *p++;
        out[i] = '\0';
    } else {
        size_t i = 0;
        while (*p && *p != ',' && *p != '}' && i < out_len - 1) out[i++] = *p++;
        out[i] = '\0';
    }
    return 1;
}

/* Escapa uma string para uso seguro dentro de uma query SQL.
 * out_size deve ser pelo menos (2 * strlen(in)) + 1.
 * Trunca a entrada se necessario para caber no buffer de saida. */
static void db_escape(MYSQL *db, char *out, size_t out_size, const char *in) {
    if (out_size == 0) return;
    size_t in_len = strlen(in);
    size_t max_len = (out_size - 1) / 2;
    if (in_len > max_len) in_len = max_len;
    mysql_real_escape_string(db, out, in, in_len);
}

/* Gera nbytes de dados criptograficamente aleatorios (via /dev/urandom) e
 * escreve como string hexadecimal em out (out deve ter espaco para nbytes*2+1). */
static void gen_random_hex(char *out, int nbytes) {
    unsigned char buf[64];
    if (nbytes > (int)sizeof(buf)) nbytes = (int)sizeof(buf);
    int fd = open("/dev/urandom", O_RDONLY);
    if (fd >= 0) {
        ssize_t r = read(fd, buf, nbytes);
        close(fd);
        if (r != nbytes) { for (int i = 0; i < nbytes; i++) buf[i] = (unsigned char)rand(); }
    } else {
        for (int i = 0; i < nbytes; i++) buf[i] = (unsigned char)rand();
    }
    for (int i = 0; i < nbytes; i++) sprintf(out + i * 2, "%02x", buf[i]);
    out[nbytes * 2] = '\0';
}

/* Calcula SHA-256(salt + senha) em hexadecimal (64 caracteres + '\0').
 * O salt garante que duas senhas iguais gerem hashes diferentes no banco. */
static void calc_senha_hash(const char *senha, const char *salt, char *out_hex) {
    char combined[300];
    snprintf(combined, sizeof(combined), "%s%s", salt, senha);
    unsigned char digest[SHA256_DIGEST_LENGTH];
    SHA256((unsigned char *)combined, strlen(combined), digest);
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) sprintf(out_hex + i * 2, "%02x", digest[i]);
    out_hex[SHA256_DIGEST_LENGTH * 2] = '\0';
}

/* Le o header Authorization ("Bearer <token>") e retorna o cliente_id
 * correspondente a uma sessao valida e nao expirada, ou 0 se invalido/ausente. */
static int resolver_cliente_por_token(struct mg_http_message *hm, MYSQL *db) {
    struct mg_str *auth = mg_http_get_header(hm, "Authorization");
    if (!auth || auth->len == 0) return 0;

    char token[80];
    size_t tl = auth->len < sizeof(token) - 1 ? auth->len : sizeof(token) - 1;
    memcpy(token, auth->buf, tl);
    token[tl] = '\0';

    char *t = token;
    if (strncmp(t, "Bearer ", 7) == 0) t += 7;

    char token_esc[170];
    db_escape(db, token_esc, sizeof(token_esc), t);

    char q[300];
    snprintf(q, sizeof(q),
        "SELECT cliente_id FROM sessoes WHERE token = '%s' AND expira_em > NOW()", token_esc);
    MYSQL_RES *res = db_query(db, q);
    if (!res) return 0;
    MYSQL_ROW row = mysql_fetch_row(res);
    int cliente_id = row ? atoi(row[0]) : 0;
    mysql_free_result(res);
    return cliente_id;
}

void handler_times_listar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db) {
    (void)hm;
    MYSQL_RES *res = db_query(db, "SELECT id, nome, pais FROM times ORDER BY nome");
    if (!res) { send_error(c, 500, "Erro ao buscar times"); return; }
    char buf[4096];
    int len = snprintf(buf, sizeof(buf), "[");
    MYSQL_ROW row;
    int first = 1;
    while ((row = mysql_fetch_row(res))) {
        len += snprintf(buf + len, sizeof(buf) - len,
            "%s{\"id\":%s,\"nome\":\"%s\",\"pais\":\"%s\"}",
            first ? "" : ",", row[0], row[1], row[2] ? row[2] : "");
        first = 0;
    }
    snprintf(buf + len, sizeof(buf) - len, "]");
    mysql_free_result(res);
    send_json(c, 200, buf);
}

void handler_camisas_listar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db) {
    char time_id_str[16] = "";
    mg_http_get_var(&hm->query, "time_id", time_id_str, sizeof(time_id_str));
    char query[512];
    if (strlen(time_id_str) > 0) {
        int time_id = atoi(time_id_str);
        snprintf(query, sizeof(query),
            "SELECT c.id, c.nome, c.preco, c.temporada, c.tipo, c.estoque, "
            "c.imagem_url, t.nome FROM camisas c JOIN times t ON c.time_id = t.id "
            "WHERE c.time_id = %d ORDER BY c.id", time_id);
    } else {
        snprintf(query, sizeof(query),
            "SELECT c.id, c.nome, c.preco, c.temporada, c.tipo, c.estoque, "
            "c.imagem_url, t.nome FROM camisas c JOIN times t ON c.time_id = t.id ORDER BY c.id");
    }
    MYSQL_RES *res = db_query(db, query);
    if (!res) { send_error(c, 500, "Erro ao buscar camisas"); return; }
    char buf[8192];
    int len = snprintf(buf, sizeof(buf), "[");
    MYSQL_ROW row;
    int first = 1;
    while ((row = mysql_fetch_row(res))) {
        len += snprintf(buf + len, sizeof(buf) - len,
            "%s{\"id\":%s,\"nome\":\"%s\",\"preco\":%s,"
            "\"temporada\":\"%s\",\"tipo\":\"%s\","
            "\"estoque\":%s,\"imagem_url\":\"%s\",\"time\":\"%s\"}",
            first ? "" : ",",
            row[0], row[1], row[2],
            row[3] ? row[3] : "", row[4] ? row[4] : "",
            row[5], row[6] ? row[6] : "", row[7]);
        first = 0;
    }
    snprintf(buf + len, sizeof(buf) - len, "]");
    mysql_free_result(res);
    send_json(c, 200, buf);
}

void handler_camisa_obter(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db, int id) {
    (void)hm;
    char query[256];
    snprintf(query, sizeof(query),
        "SELECT c.id, c.nome, c.descricao, c.preco, c.temporada, c.tipo, "
        "c.estoque, c.imagem_url, t.nome FROM camisas c "
        "JOIN times t ON c.time_id = t.id WHERE c.id = %d", id);
    MYSQL_RES *res = db_query(db, query);
    if (!res) { send_error(c, 500, "Erro interno"); return; }
    MYSQL_ROW row = mysql_fetch_row(res);
    if (!row) { send_error(c, 404, "Camisa nao encontrada"); mysql_free_result(res); return; }
    char buf[1024];
    snprintf(buf, sizeof(buf),
        "{\"id\":%s,\"nome\":\"%s\",\"descricao\":\"%s\","
        "\"preco\":%s,\"temporada\":\"%s\",\"tipo\":\"%s\","
        "\"estoque\":%s,\"imagem_url\":\"%s\",\"time\":\"%s\"}",
        row[0], row[1], row[2] ? row[2] : "",
        row[3], row[4] ? row[4] : "", row[5] ? row[5] : "",
        row[6], row[7] ? row[7] : "", row[8]);
    mysql_free_result(res);
    send_json(c, 200, buf);
}

void handler_camisa_criar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db) {
    char body[2048];
    size_t len = hm->body.len < sizeof(body)-1 ? hm->body.len : sizeof(body)-1;
    memcpy(body, hm->body.buf, len); body[len] = '\0';
    char time_id[16], nome[150], preco[20], temporada[20], tipo[20], estoque[16];
    if (!json_get_string(body, "time_id", time_id, sizeof(time_id)) ||
        !json_get_string(body, "nome", nome, sizeof(nome)) ||
        !json_get_string(body, "preco", preco, sizeof(preco))) {
        send_error(c, 400, "Campos obrigatorios: time_id, nome, preco"); return;
    }
    if (!json_get_string(body, "temporada", temporada, sizeof(temporada))) strcpy(temporada, "");
    if (!json_get_string(body, "tipo", tipo, sizeof(tipo))) strcpy(tipo, "casa");
    if (!json_get_string(body, "estoque", estoque, sizeof(estoque))) strcpy(estoque, "0");

    int time_id_i = atoi(time_id);
    double preco_d = atof(preco);
    int estoque_i = atoi(estoque);

    char nome_esc[301], temporada_esc[41], tipo_esc[41];
    db_escape(db, nome_esc, sizeof(nome_esc), nome);
    db_escape(db, temporada_esc, sizeof(temporada_esc), temporada);
    db_escape(db, tipo_esc, sizeof(tipo_esc), tipo);

    char query[512];
    snprintf(query, sizeof(query),
        "INSERT INTO camisas (time_id, nome, preco, temporada, tipo, estoque) "
        "VALUES (%d, '%s', %.2f, '%s', '%s', %d)",
        time_id_i, nome_esc, preco_d, temporada_esc, tipo_esc, estoque_i);
    if (db_exec(db, query) != 0) { send_error(c, 500, "Erro ao inserir"); return; }
    unsigned long long new_id = mysql_insert_id(db);
    char resp[64];
    snprintf(resp, sizeof(resp), "{\"id\":%llu,\"mensagem\":\"Camisa criada\"}", new_id);
    send_json(c, 201, resp);
}

void handler_pedido_criar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db) {
    char body[4096];
    size_t blen = hm->body.len < sizeof(body)-1 ? hm->body.len : sizeof(body)-1;
    memcpy(body, hm->body.buf, blen); body[blen] = '\0';
    char cliente_nome[150], cliente_email[150];
    if (!json_get_string(body, "cliente_nome", cliente_nome, sizeof(cliente_nome)) ||
        !json_get_string(body, "cliente_email", cliente_email, sizeof(cliente_email))) {
        send_error(c, 400, "Campos obrigatorios: cliente_nome, cliente_email"); return;
    }
    char cliente_nome_esc[301], cliente_email_esc[301];
    db_escape(db, cliente_nome_esc, sizeof(cliente_nome_esc), cliente_nome);
    db_escape(db, cliente_email_esc, sizeof(cliente_email_esc), cliente_email);

    int cliente_id = resolver_cliente_por_token(hm, db);

    db_exec(db, "START TRANSACTION");
    char q[760];
    if (cliente_id > 0) {
        snprintf(q, sizeof(q),
            "INSERT INTO pedidos (cliente_id, cliente_nome, cliente_email, total) VALUES (%d, '%s', '%s', 0.00)",
            cliente_id, cliente_nome_esc, cliente_email_esc);
    } else {
        snprintf(q, sizeof(q),
            "INSERT INTO pedidos (cliente_nome, cliente_email, total) VALUES ('%s', '%s', 0.00)",
            cliente_nome_esc, cliente_email_esc);
    }
    if (db_exec(db, q) != 0) { db_exec(db, "ROLLBACK"); send_error(c, 500, "Erro ao criar pedido"); return; }
    unsigned long long pedido_id = mysql_insert_id(db);
    double total = 0.0;
    const char *p = strstr(body, "\"itens\"");
    if (p) {
        p = strchr(p, '[');
        while (p && *p && *p != ']') {
            const char *os = strchr(p, '{');
            if (!os) break;
            const char *oe = strchr(os, '}');
            if (!oe) break;
            char item[256];
            size_t il = oe - os + 1;
            if (il >= sizeof(item)) { p = oe+1; continue; }
            memcpy(item, os, il); item[il] = '\0';
            char camisa_id_str[16], qtd_str[8], tamanho[8];
            if (!json_get_string(item, "camisa_id", camisa_id_str, sizeof(camisa_id_str)) ||
                !json_get_string(item, "quantidade", qtd_str, sizeof(qtd_str)) ||
                !json_get_string(item, "tamanho", tamanho, sizeof(tamanho))) { p = oe+1; continue; }

            int camisa_id = atoi(camisa_id_str);
            int qtd = atoi(qtd_str);
            char tamanho_esc[17];
            db_escape(db, tamanho_esc, sizeof(tamanho_esc), tamanho);

            char qp[128];
            snprintf(qp, sizeof(qp), "SELECT preco FROM camisas WHERE id = %d", camisa_id);
            MYSQL_RES *res = db_query(db, qp);
            if (!res) { p = oe+1; continue; }
            MYSQL_ROW row = mysql_fetch_row(res);
            double preco_unit = row ? atof(row[0]) : 0;
            mysql_free_result(res);
            total += preco_unit * qtd;
            snprintf(q, sizeof(q),
                "INSERT INTO pedido_itens (pedido_id, camisa_id, quantidade, tamanho, preco_unit) "
                "VALUES (%llu, %d, %d, '%s', %.2f)", pedido_id, camisa_id, qtd, tamanho_esc, preco_unit);
            db_exec(db, q);
            snprintf(q, sizeof(q), "UPDATE camisas SET estoque = estoque - %d WHERE id = %d", qtd, camisa_id);
            db_exec(db, q);
            p = oe+1;
        }
    }
    snprintf(q, sizeof(q), "UPDATE pedidos SET total = %.2f WHERE id = %llu", total, pedido_id);
    db_exec(db, q);
    db_exec(db, "COMMIT");
    char resp[128];
    snprintf(resp, sizeof(resp), "{\"pedido_id\":%llu,\"total\":%.2f,\"mensagem\":\"Pedido criado\"}", pedido_id, total);
    send_json(c, 201, resp);
}

void handler_pedido_obter(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db, int id) {
    (void)hm;
    char query[256];
    snprintf(query, sizeof(query),
        "SELECT id, cliente_nome, cliente_email, total, status FROM pedidos WHERE id = %d", id);
    MYSQL_RES *res = db_query(db, query);
    if (!res) { send_error(c, 500, "Erro interno"); return; }
    MYSQL_ROW row = mysql_fetch_row(res);
    if (!row) { send_error(c, 404, "Pedido nao encontrado"); mysql_free_result(res); return; }
    char buf[2048];
    int len = snprintf(buf, sizeof(buf),
        "{\"id\":%s,\"cliente_nome\":\"%s\",\"cliente_email\":\"%s\","
        "\"total\":%s,\"status\":\"%s\",\"itens\":[",
        row[0], row[1], row[2], row[3], row[4]);
    mysql_free_result(res);
    snprintf(query, sizeof(query),
        "SELECT pi.id, c.nome, pi.quantidade, pi.tamanho, pi.preco_unit "
        "FROM pedido_itens pi JOIN camisas c ON pi.camisa_id = c.id WHERE pi.pedido_id = %d", id);
    res = db_query(db, query);
    if (res) {
        int first = 1;
        while ((row = mysql_fetch_row(res))) {
            len += snprintf(buf + len, sizeof(buf) - len,
                "%s{\"id\":%s,\"camisa\":\"%s\",\"quantidade\":%s,\"tamanho\":\"%s\",\"preco_unit\":%s}",
                first ? "" : ",", row[0], row[1], row[2], row[3], row[4]);
            first = 0;
        }
        mysql_free_result(res);
    }
    snprintf(buf + len, sizeof(buf) - len, "]}");
    send_json(c, 200, buf);
}

void handler_cliente_cadastrar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db) {
    char body[1024];
    size_t len = hm->body.len < sizeof(body)-1 ? hm->body.len : sizeof(body)-1;
    memcpy(body, hm->body.buf, len); body[len] = '\0';

    char nome[150], email[150], senha[100];
    if (!json_get_string(body, "nome", nome, sizeof(nome)) ||
        !json_get_string(body, "email", email, sizeof(email)) ||
        !json_get_string(body, "senha", senha, sizeof(senha))) {
        send_error(c, 400, "Campos obrigatorios: nome, email, senha"); return;
    }
    if (strlen(senha) < 6) { send_error(c, 400, "A senha deve ter pelo menos 6 caracteres"); return; }
    if (strlen(nome) == 0 || strlen(email) == 0) { send_error(c, 400, "Nome e email nao podem ser vazios"); return; }

    char nome_esc[301], email_esc[301];
    db_escape(db, nome_esc, sizeof(nome_esc), nome);
    db_escape(db, email_esc, sizeof(email_esc), email);

    char qcheck[400];
    snprintf(qcheck, sizeof(qcheck), "SELECT id FROM clientes WHERE email = '%s'", email_esc);
    MYSQL_RES *rcheck = db_query(db, qcheck);
    if (rcheck) {
        int existe = mysql_num_rows(rcheck) > 0;
        mysql_free_result(rcheck);
        if (existe) { send_error(c, 409, "Este email ja esta cadastrado"); return; }
    }

    char salt[33], hash[65];
    gen_random_hex(salt, 16);
    calc_senha_hash(senha, salt, hash);

    char query[900];
    snprintf(query, sizeof(query),
        "INSERT INTO clientes (nome, email, senha_hash, salt) VALUES ('%s', '%s', '%s', '%s')",
        nome_esc, email_esc, hash, salt);
    if (db_exec(db, query) != 0) { send_error(c, 500, "Erro ao cadastrar cliente"); return; }

    unsigned long long id = mysql_insert_id(db);
    char resp[128];
    snprintf(resp, sizeof(resp), "{\"id\":%llu,\"mensagem\":\"Cadastro realizado com sucesso\"}", id);
    send_json(c, 201, resp);
}

void handler_cliente_login(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db) {
    char body[512];
    size_t len = hm->body.len < sizeof(body)-1 ? hm->body.len : sizeof(body)-1;
    memcpy(body, hm->body.buf, len); body[len] = '\0';

    char email[150], senha[100];
    if (!json_get_string(body, "email", email, sizeof(email)) ||
        !json_get_string(body, "senha", senha, sizeof(senha))) {
        send_error(c, 400, "Campos obrigatorios: email, senha"); return;
    }

    char email_esc[301];
    db_escape(db, email_esc, sizeof(email_esc), email);

    char query[400];
    snprintf(query, sizeof(query),
        "SELECT id, nome, email, senha_hash, salt FROM clientes WHERE email = '%s'", email_esc);
    MYSQL_RES *res = db_query(db, query);
    if (!res) { send_error(c, 500, "Erro interno"); return; }
    MYSQL_ROW row = mysql_fetch_row(res);
    if (!row) { mysql_free_result(res); send_error(c, 401, "Email ou senha invalidos"); return; }

    char hash_calc[65];
    calc_senha_hash(senha, row[4], hash_calc);
    if (strcmp(hash_calc, row[3]) != 0) {
        mysql_free_result(res);
        send_error(c, 401, "Email ou senha invalidos"); return;
    }

    char id_str[16], nome[151], email_out[151];
    snprintf(id_str, sizeof(id_str), "%s", row[0]);
    snprintf(nome, sizeof(nome), "%s", row[1]);
    snprintf(email_out, sizeof(email_out), "%s", row[2]);
    mysql_free_result(res);

    char token[65];
    gen_random_hex(token, 32);

    char qins[300];
    snprintf(qins, sizeof(qins),
        "INSERT INTO sessoes (token, cliente_id, expira_em) VALUES ('%s', %s, DATE_ADD(NOW(), INTERVAL 7 DAY))",
        token, id_str);
    if (db_exec(db, qins) != 0) { send_error(c, 500, "Erro ao criar sessao"); return; }

    char resp[600];
    snprintf(resp, sizeof(resp),
        "{\"token\":\"%s\",\"cliente\":{\"id\":%s,\"nome\":\"%s\",\"email\":\"%s\"}}",
        token, id_str, nome, email_out);
    send_json(c, 200, resp);
}

void handler_cliente_pedidos(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db) {
    int cliente_id = resolver_cliente_por_token(hm, db);
    if (!cliente_id) { send_error(c, 401, "Sessao invalida ou expirada. Faca login novamente."); return; }

    char query[300];
    snprintf(query, sizeof(query),
        "SELECT id, total, status, criado_em FROM pedidos "
        "WHERE cliente_id = %d ORDER BY criado_em DESC", cliente_id);
    MYSQL_RES *res = db_query(db, query);
    if (!res) { send_error(c, 500, "Erro interno"); return; }

    char buf[8192];
    int len = snprintf(buf, sizeof(buf), "[");
    MYSQL_ROW row;
    int first = 1;
    while ((row = mysql_fetch_row(res))) {
        len += snprintf(buf + len, sizeof(buf) - len,
            "%s{\"id\":%s,\"total\":%s,\"status\":\"%s\",\"criado_em\":\"%s\"}",
            first ? "" : ",", row[0], row[1], row[2], row[3]);
        first = 0;
    }
    snprintf(buf + len, sizeof(buf) - len, "]");
    mysql_free_result(res);
    send_json(c, 200, buf);
}