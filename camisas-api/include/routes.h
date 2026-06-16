#ifndef ROUTES_H
#define ROUTES_H
#include "../lib/mongoose.h"
#include <mysql/mysql.h>
void handler_camisas_listar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db);
void handler_camisa_obter(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db, int id);
void handler_camisa_criar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db);
void handler_times_listar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db);
void handler_pedido_criar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db);
void handler_pedido_obter(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db, int id);
#endif
