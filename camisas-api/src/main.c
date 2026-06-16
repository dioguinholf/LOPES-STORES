#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <signal.h>
#include "../lib/mongoose.h"
#include "../include/db.h"
#include "../include/routes.h"

#define PORTA "http://0.0.0.0:8080"

typedef struct { MYSQL *db; } AppCtx;

static void event_handler(struct mg_connection *c, int ev, void *ev_data) {
    AppCtx *ctx = (AppCtx *)c->fn_data;
    if (ev == MG_EV_HTTP_MSG) {
        struct mg_http_message *hm = (struct mg_http_message *)ev_data;
        MYSQL *db = ctx->db;

        printf("[%s] %.*s %.*s\n", c->rem.ip,
               (int)hm->method.len, hm->method.buf,
               (int)hm->uri.len, hm->uri.buf);

        if (mg_match(hm->method, mg_str("OPTIONS"), NULL)) {
            mg_http_reply(c, 204,
                "Access-Control-Allow-Origin: *\r\n"
                "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                "Access-Control-Allow-Headers: Content-Type\r\n", "");
            return;
        }

        if (mg_match(hm->uri, mg_str("/api/times"), NULL)) {
            if (mg_match(hm->method, mg_str("GET"), NULL))
                handler_times_listar(c, hm, db);
            return;
        }
        if (mg_match(hm->uri, mg_str("/api/camisas"), NULL)) {
            if (mg_match(hm->method, mg_str("GET"), NULL))
                handler_camisas_listar(c, hm, db);
            else if (mg_match(hm->method, mg_str("POST"), NULL))
                handler_camisa_criar(c, hm, db);
            return;
        }
        if (mg_match(hm->uri, mg_str("/api/camisas/*"), NULL)) {
            char id_str[16];
            const char *p = hm->uri.buf + strlen("/api/camisas/");
            size_t id_len = hm->uri.len - strlen("/api/camisas/");
            if (id_len >= sizeof(id_str)) id_len = sizeof(id_str) - 1;
            memcpy(id_str, p, id_len); id_str[id_len] = '\0';
            if (mg_match(hm->method, mg_str("GET"), NULL))
                handler_camisa_obter(c, hm, db, atoi(id_str));
            return;
        }
        if (mg_match(hm->uri, mg_str("/api/pedidos"), NULL)) {
            if (mg_match(hm->method, mg_str("POST"), NULL))
                handler_pedido_criar(c, hm, db);
            return;
        }
        if (mg_match(hm->uri, mg_str("/api/pedidos/*"), NULL)) {
            char id_str[16];
            const char *p = hm->uri.buf + strlen("/api/pedidos/");
            size_t id_len = hm->uri.len - strlen("/api/pedidos/");
            if (id_len >= sizeof(id_str)) id_len = sizeof(id_str) - 1;
            memcpy(id_str, p, id_len); id_str[id_len] = '\0';
            if (mg_match(hm->method, mg_str("GET"), NULL))
                handler_pedido_obter(c, hm, db, atoi(id_str));
            return;
        }

        mg_http_reply(c, 404,
            "Content-Type: application/json\r\n"
            "Access-Control-Allow-Origin: *\r\n",
            "{\"erro\":\"Rota não encontrada\"}");
    }
}

int main(void) {
    printf("╔══════════════════════════════════════╗\n");
    printf("║   Camisas de Time API  — v1.0        ║\n");
    printf("╚══════════════════════════════════════╝\n\n");

    MYSQL *db = db_conectar();
    if (!db) { fprintf(stderr, "Falha ao conectar ao banco.\n"); return EXIT_FAILURE; }

    AppCtx ctx = { .db = db };
    struct mg_mgr mgr;
    mg_mgr_init(&mgr);

    if (!mg_http_listen(&mgr, PORTA, event_handler, &ctx)) {
        fprintf(stderr, "Falha ao escutar em %s\n", PORTA);
        mg_mgr_free(&mgr); db_desconectar(db); return EXIT_FAILURE;
    }

    printf("[Server] Rodando em %s\n\n", PORTA);
    for (;;) mg_mgr_poll(&mgr, 1000);

    mg_mgr_free(&mgr);
    db_desconectar(db);
    return EXIT_SUCCESS;
}