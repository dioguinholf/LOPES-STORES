#ifndef DB_H
#define DB_H
#include <mysql/mysql.h>
#include <stdio.h>
#define DB_HOST     "127.0.0.1"
#define DB_USER     "camisas_user"
#define DB_PASSWORD "camisas_pass"
#define DB_NAME     "camisas_db"
#define DB_PORT     3306
MYSQL *db_conectar(void);
void db_desconectar(MYSQL *conn);
MYSQL_RES *db_query(MYSQL *conn, const char *query);
int db_exec(MYSQL *conn, const char *query);
#endif
