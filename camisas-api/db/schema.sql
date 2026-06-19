CREATE DATABASE IF NOT EXISTS camisas_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE camisas_db;

CREATE TABLE IF NOT EXISTS times (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL,
  pais      VARCHAR(50),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS camisas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  time_id    INT NOT NULL,
  nome       VARCHAR(150) NOT NULL,
  descricao  TEXT,
  preco      DECIMAL(10,2) NOT NULL,
  temporada  VARCHAR(20),
  tipo       ENUM('casa','fora','terceiro') DEFAULT 'casa',
  estoque    INT DEFAULT 0,
  imagem_url VARCHAR(255),
  criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (time_id) REFERENCES times(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pedidos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  cliente_nome  VARCHAR(150) NOT NULL,
  cliente_email VARCHAR(150) NOT NULL,
  total         DECIMAL(10,2) NOT NULL,
  status        ENUM('pendente','pago','enviado','cancelado') DEFAULT 'pendente',
  criado_em     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pedido_itens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id  INT NOT NULL,
  camisa_id  INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  tamanho    ENUM('PP','P','M','G','GG','XGG') NOT NULL,
  preco_unit DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (camisa_id) REFERENCES camisas(id)
);

INSERT INTO times (nome, pais) VALUES
  ('Flamengo', 'Brasil'),
  ('Corinthians', 'Brasil'),
  ('Real Madrid', 'Espanha'),
  ('Manchester City', 'Inglaterra');

INSERT INTO camisas (time_id, nome, preco, temporada, tipo, estoque) VALUES
  (1, 'Camisa Flamengo I 2024/25',        299.90, '2024/2025', 'casa', 50),
  (1, 'Camisa Flamengo II 2024/25',       289.90, '2024/2025', 'fora', 30),
  (2, 'Camisa Corinthians I 2024/25',     279.90, '2024/2025', 'casa', 40),
  (3, 'Camisa Real Madrid I 2024/25',     399.90, '2024/2025', 'casa', 25),
  (4, 'Camisa Manchester City I 2024/25', 379.90, '2024/2025', 'casa', 20);
