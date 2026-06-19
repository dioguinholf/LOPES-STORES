<<<<<<< HEAD

#include "../include/db.h"
#include <stdlib.h>
#include <string.h>

MYSQL *db_conectar(void) {
    MYSQL *conn = mysql_init(NULL);
    if (!conn) { fprintf(stderr, "[DB] Falha ao inicializar\n"); return NULL; }
    if (!mysql_real_connect(conn, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, NULL, 0)) {
        fprintf(stderr, "[DB] Erro: %s\n", mysql_error(conn));
        mysql_close(conn); return NULL;
    }
    mysql_set_character_set(conn, "utf8mb4");
    printf("[DB] Conectado ao banco '%s'\n", DB_NAME);
=======
#include "db.h"

MYSQL *db_conectar(void) {
    MYSQL *conn = mysql_init(NULL);

    if (conn == NULL) {
        fprintf(stderr, "Erro ao inicializar MySQL\n");
        return NULL;
    }

    if (mysql_real_connect(conn, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, NULL, 0) == NULL) {
        fprintf(stderr, "Erro ao conectar ao banco: %s\n", mysql_error(conn));
        mysql_close(conn);
        return NULL;
    }

>>>>>>> fd6e266 (Corrige build e conexão com banco)
    return conn;
}

void db_desconectar(MYSQL *conn) {
<<<<<<< HEAD
    if (conn) { mysql_close(conn); printf("[DB] Conexão encerrada\n"); }
}

MYSQL_RES *db_query(MYSQL *conn, const char *query) {
    if (mysql_query(conn, query)) {
        fprintf(stderr, "[DB] Erro: %s\n", mysql_error(conn)); return NULL;
    }
=======
    if (conn != NULL) {
        mysql_close(conn);
    }
}

MYSQL_RES *db_query(MYSQL *conn, const char *query) {
    if (mysql_query(conn, query) != 0) {
        fprintf(stderr, "Erro na query: %s\n", mysql_error(conn));
        return NULL;
    }

>>>>>>> fd6e266 (Corrige build e conexão com banco)
    return mysql_store_result(conn);
}

int db_exec(MYSQL *conn, const char *query) {
<<<<<<< HEAD
    if (mysql_query(conn, query)) {
        fprintf(stderr, "[DB] Erro: %s\n", mysql_error(conn)); return -1;
    }
    return 0;
}
EOF
echo "db.c criado!"
=======
    if (mysql_query(conn, query) != 0) {
        fprintf(stderr, "Erro ao executar comando: %s\n", mysql_error(conn));
        return 1;
    }

    return 0;
}
>>>>>>> fd6e266 (Corrige build e conexão com banco)
