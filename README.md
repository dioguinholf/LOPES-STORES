<div align="center">

# ⚽ LOPES STORES

### Loja de Camisas de Time — Full Stack

![C](https://img.shields.io/badge/Back--end-C-blue?style=for-the-badge&logo=c)
![React](https://img.shields.io/badge/Front--end-React-61DAFB?style=for-the-badge&logo=react)
![MySQL](https://img.shields.io/badge/Banco-MariaDB-003545?style=for-the-badge&logo=mariadb)
![GitHub](https://img.shields.io/badge/Deploy-Codespaces-181717?style=for-the-badge&logo=github)

> API REST em C com servidor HTTP embarcado [Mongoose](https://mongoose.ws/) + front-end React para gerenciar e vender camisas de times de futebol.

---

</div>

## 🖥️ Demonstração

| Catálogo | Carrinho |
|---|---|
| Listagem de camisas com filtro por time | Checkout com seleção de tamanho e finalização |

---

## 🏗️ Arquitetura  ---

## ⚙️ Stack

| Camada | Tecnologia |
|---|---|
| Linguagem back-end | C (C99) |
| Servidor HTTP | Mongoose (embedded) |
| Banco de dados | MySQL / MariaDB |
| Front-end | React 19 |
| HTTP Client | Axios |
| Roteamento | React Router DOM |
| Deploy | GitHub Codespaces |

---

## 🚀 Como rodar

### Pré-requisitos
```bash
sudo apt install gcc make libmysqlclient-dev mariadb-server
```

### Back-end
```bash
cd camisas-api

# Criar banco e tabelas
sudo service mariadb start
sudo mysql < db/schema.sql

# Compilar e rodar
make
./camisas-api
# API disponível em http://localhost:8080
```

### Front-end
```bash
cd frontend
npm install
npm start
# App disponível em http://localhost:3000
```

---

## 🔗 Endpoints da API

### Times
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/times` | Lista todos os times |

### Camisas
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/camisas` | Lista todas as camisas |
| `GET` | `/api/camisas?time_id=1` | Filtra por time |
| `GET` | `/api/camisas/:id` | Detalhe de uma camisa |
| `POST` | `/api/camisas` | Cadastra nova camisa |

### Pedidos
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/pedidos` | Cria pedido com itens |
| `GET` | `/api/pedidos/:id` | Consulta pedido por ID |

---

## 📡 Exemplos

```bash
# Listar times
curl http://localhost:8080/api/times

# Listar camisas do Flamengo
curl "http://localhost:8080/api/camisas?time_id=1"

# Criar pedido
curl -X POST http://localhost:8080/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nome": "João Silva",
    "cliente_email": "joao@email.com",
    "itens": [
      {"camisa_id": 1, "quantidade": 1, "tamanho": "G"}
    ]
  }'
```

---

## 🗺️ Roadmap

- [x] API REST em C com Mongoose
- [x] Banco de dados MariaDB
- [x] Front-end React com catálogo
- [x] Filtro por time
- [x] Carrinho de compras
- [x] Checkout e criação de pedidos
- [ ] Painel admin (cadastro/edição de camisas)
- [ ] Autenticação JWT
- [ ] Upload de imagens
- [ ] Integração com gateway de pagamento

---

<div align="center">

Desenvolvido por **[@dioguinholf](https://github.com/dioguinholf)** 🇧🇷

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=dioguinholf.LOPES-STORES)

</div>
