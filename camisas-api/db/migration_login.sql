-- Migração: adiciona sistema de cadastro/login de clientes
-- Rode este script UMA VEZ no banco já existente (sudo mysql < db/migration_login.sql)

USE camisas_db;

CREATE TABLE IF NOT EXISTS clientes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(150) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  senha_hash CHAR(64) NOT NULL,
  salt       CHAR(32) NOT NULL,
  criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessoes (
  token      CHAR(64) PRIMARY KEY,
  cliente_id INT NOT NULL,
  criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expira_em  TIMESTAMP NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS cliente_id INT NULL AFTER id;

SET @fk_existe = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = 'camisas_db'
    AND TABLE_NAME = 'pedidos'
    AND CONSTRAINT_NAME = 'fk_pedidos_cliente'
);
SET @sql = IF(@fk_existe = 0,
  'ALTER TABLE pedidos ADD CONSTRAINT fk_pedidos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL',
  'SELECT "Foreign key ja existe, pulando."');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migracao concluida com sucesso.' AS resultado;