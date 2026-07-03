#include "../include/routes.h"
#include "../include/db.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

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

    db_exec(db, "START TRANSACTION");
    char q[700];
    snprintf(q, sizeof(q),
        "INSERT INTO pedidos (cliente_nome, cliente_email, total) VALUES ('%s', '%s', 0.00)",
        cliente_nome_esc, cliente_email_esc);
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