cat > src/db.c << 'EOF'
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
    return conn;
}

void db_desconectar(MYSQL *conn) {
    if (conn) { mysql_close(conn); printf("[DB] Conexão encerrada\n"); }
}

MYSQL_RES *db_query(MYSQL *conn, const char *query) {
    if (mysql_query(conn, query)) {
        fprintf(stderr, "[DB] Erro: %s\n", mysql_error(conn)); return NULL;
    }
    return mysql_store_result(conn);
}

int db_exec(MYSQL *conn, const char *query) {
    if (mysql_query(conn, query)) {
        fprintf(stderr, "[DB] Erro: %s\n", mysql_error(conn)); return -1;
    }
    return 0;
}
EOF
echo "db.c criado!"