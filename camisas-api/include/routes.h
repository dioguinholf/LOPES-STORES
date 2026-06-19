#ifndef ROUTES_H
#define ROUTES_H

#include "mongoose.h"

void handle_request(struct mg_connection *c, int ev, void *ev_data);

#endif
