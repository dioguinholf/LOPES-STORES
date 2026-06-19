# 🏟️ Camisas de Time API

API REST desenvolvida em C com Mongoose e MySQL para gerenciamento de times, camisas, pedidos e itens de pedido.

-----

## 📋 Índice

- [Sobre o projeto](#-sobre-o-projeto)
- [Tecnologias](#-tecnologias)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e configuração](#-instalação-e-configuração)
- [Compilar e rodar](#-compilar-e-rodar)
- [Endpoints da API](#-endpoints-da-api)
- [Exemplos de uso](#-exemplos-de-uso)
- [Próximos passos](#-próximos-passos)
- [Licença](#-licença)

-----

## 📌 Sobre o projeto

API RESTful desenvolvida em linguagem C para gerenciar um e-commerce de camisas de times de futebol. O sistema permite cadastrar times, camisas e processar pedidos com controle de estoque em transações atômicas.

Projeto pessoal com foco em aprendizado de programação de sistemas, protocolos HTTP e integração com banco de dados relacionais diretamente em C.

-----

## 🛠 Tecnologias

|Tecnologia         |Uso                                  |
|-------------------|-------------------------------------|
|**C (C99)**        |Linguagem principal                  |
|**Mongoose**       |Servidor HTTP embarcado (single-file)|
|**MySQL / MariaDB**|Banco de dados relacional            |
|**libmysqlclient** |Conector C para MySQL                |
|**Make**           |Build system                         |

-----

## 📁 Estrutura do projeto

```
camisas-api/
├── src/
│   ├── main.c          # Servidor + roteador principal
│   ├── db.c            # Conexão e helpers MySQL
│   └── routes.c        # Handlers de cada endpoint
├── include/
│   ├── db.h            # Header do módulo de banco
│   └── routes.h        # Header das rotas
├── lib/
│   ├── mongoose.h      # Biblioteca HTTP (single-file)
│   └── mongoose.c
├── db/
│   └── schema.sql      # Schema completo + dados de exemplo
├── Makefile
└── README.md
```

-----

## ✅ Pré-requisitos

- GCC ou Clang
- Make
- MySQL ou MariaDB rodando localmente
- libmysqlclient-dev

```bash
# Ubuntu / Debian
sudo apt install gcc make libmysqlclient-dev

# Fedora / RHEL
sudo dnf install gcc make mysql-devel

# macOS (Homebrew)
brew install mysql-client
```

-----

## ⚙️ Instalação e configuração

**1. Clone o repositório**

```bash
git clone https://github.com/seu-usuario/camisas-api.git
cd camisas-api
```

**2. Configure as credenciais do banco**

Edite o arquivo `include/db.h`:

```c
#define DB_HOST     "127.0.0.1"
#define DB_USER     "root"
#define DB_PASSWORD "sua_senha"
#define DB_NAME     "camisas_db"
#define DB_PORT     3306
```

**3. Crie o banco de dados**

```bash
mysql -u root -p < db/schema.sql
```

Isso cria o banco `camisas_db` com as tabelas e insere dados de exemplo (4 times e 5 camisas).

-----

## 🚀 Compilar e rodar

```bash
make        # Compila o projeto
make run    # Compila e executa
make clean  # Remove o binário
```

O servidor sobe em **`http://localhost:8080`**

```
╔══════════════════════════════════════╗
║   Camisas de Time API  — v1.0        ║
╚══════════════════════════════════════╝

[DB] Conectado ao banco 'camisas_db'
[Server] Rodando em http://0.0.0.0:8080
```

-----

## 🔗 Endpoints da API

### Times

|Método|Rota        |Descrição           |
|------|------------|--------------------|
|`GET` |`/api/times`|Lista todos os times|

### Camisas

|Método|Rota                    |Descrição              |
|------|------------------------|-----------------------|
|`GET` |`/api/camisas`          |Lista todas as camisas |
|`GET` |`/api/camisas?time_id=1`|Filtra camisas por time|
|`GET` |`/api/camisas/:id`      |Detalhe de uma camisa  |
|`POST`|`/api/camisas`          |Cadastra nova camisa   |

### Pedidos

|Método|Rota              |Descrição             |
|------|------------------|----------------------|
|`POST`|`/api/pedidos`    |Cria um novo pedido   |
|`GET` |`/api/pedidos/:id`|Consulta pedido por ID|

-----

## 📡 Exemplos de uso

**Listar todos os times**

```bash
curl http://localhost:8080/api/times
```

```json
[
  {"id":1,"nome":"Flamengo","pais":"Brasil"},
  {"id":2,"nome":"Corinthians","pais":"Brasil"}
]
```

-----

**Listar camisas de um time**

```bash
curl "http://localhost:8080/api/camisas?time_id=1"
```

```json
[
  {
    "id": 1,
    "nome": "Camisa Flamengo I 2024/25",
    "preco": 299.90,
    "temporada": "2024/2025",
    "tipo": "casa",
    "estoque": 50,
    "time": "Flamengo"
  }
]
```

-----

**Cadastrar nova camisa**

```bash
curl -X POST http://localhost:8080/api/camisas \
  -H "Content-Type: application/json" \
  -d '{
    "time_id": 1,
    "nome": "Camisa Flamengo III 2024/25",
    "preco": 259.90,
    "temporada": "2024/2025",
    "tipo": "terceiro",
    "estoque": 15
  }'
```

```json
{"id": 6, "mensagem": "Camisa criada"}
```

-----

**Criar pedido**

```bash
curl -X POST http://localhost:8080/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nome": "João Silva",
    "cliente_email": "joao@email.com",
    "itens": [
      {"camisa_id": 1, "quantidade": 2, "tamanho": "G"},
      {"camisa_id": 3, "quantidade": 1, "tamanho": "M"}
    ]
  }'
```

```json
{
  "pedido_id": 1,
  "total": 879.70,
  "mensagem": "Pedido criado com sucesso"
}
```

-----

**Consultar pedido**

```bash
curl http://localhost:8080/api/pedidos/1
```

```json
{
  "id": 1,
  "cliente_nome": "João Silva",
  "cliente_email": "joao@email.com",
  "total": 879.70,
  "status": "pendente",
  "itens": [
    {"id": 1, "camisa": "Camisa Flamengo I 2024/25", "quantidade": 2, "tamanho": "G", "preco_unit": 299.90},
    {"id": 2, "camisa": "Camisa Corinthians I 2024/25", "quantidade": 1, "tamanho": "M", "preco_unit": 279.90}
  ]
}
```

-----

## 🗺 Próximos passos

- [ ] `PUT /api/camisas/:id` — Editar camisa
- [ ] `DELETE /api/camisas/:id` — Remover camisa
- [ ] Autenticação JWT para rotas de administrador
- [ ] Paginação no `GET /api/camisas`
- [ ] Upload de imagens das camisas
- [ ] Integração com gateway de pagamento (Mercado Pago / Stripe)
- [ ] Front-end em HTML/CSS/JS consumindo esta API

-----

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo <LICENSE> para mais detalhes.
