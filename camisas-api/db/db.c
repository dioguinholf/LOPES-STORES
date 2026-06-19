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

    return conn;
}

void db_desconectar(MYSQL *conn) {
    if (conn != NULL) {
        mysql_close(conn);
    }
}

MYSQL_RES *db_query(MYSQL *conn, const char *query) {
    if (mysql_query(conn, query) != 0) {
        fprintf(stderr, "Erro na query: %s\n", mysql_error(conn));
        return NULL;
    }

    return mysql_store_result(conn);
}

int db_exec(MYSQL *conn, const char *query) {
    if (mysql_query(conn, query) != 0) {
        fprintf(stderr, "Erro ao executar comando: %s\n", mysql_error(conn));
        return 1;
    }

    return 0;
}
