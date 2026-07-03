#ifndef ROUTES_H
#define ROUTES_H

#include "mongoose.h"
#include "db.h"

void handle_request(struct mg_connection *c, int ev, void *ev_data);

void handler_times_listar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db);
void handler_camisas_listar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db);
void handler_camisa_obter(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db, int id);
void handler_camisa_criar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db);
void handler_pedido_criar(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db);
void handler_pedido_obter(struct mg_connection *c, struct mg_http_message *hm, MYSQL *db, int id);

#endif