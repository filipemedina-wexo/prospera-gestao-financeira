-- Realiza a cópia de dados do esquema anterior para as novas tabelas
ALTER TABLE IF EXISTS clientes RENAME TO clientes_old;
ALTER TABLE IF EXISTS fornecedores RENAME TO fornecedores_old;
ALTER TABLE IF EXISTS colaboradores RENAME TO colaboradores_old;
ALTER TABLE IF EXISTS departamentos RENAME TO departamentos_old;
ALTER TABLE IF EXISTS cargos RENAME TO cargos_old;
ALTER TABLE IF EXISTS produtos_servicos RENAME TO produtos_servicos_old;
ALTER TABLE IF EXISTS categorias RENAME TO categorias_old;
ALTER TABLE IF EXISTS contas_a_pagar RENAME TO contas_a_pagar_old;
ALTER TABLE IF EXISTS contas_a_receber RENAME TO contas_a_receber_old;
ALTER TABLE IF EXISTS relatorios RENAME TO relatorios_old;
ALTER TABLE IF EXISTS usuarios RENAME TO usuarios_old;

INSERT INTO categorias (id, nome, created_at, updated_at)
SELECT id, nome, NOW(), NOW() FROM categorias_old;

INSERT INTO cargos (id, nome, descricao, created_at, updated_at)
SELECT id, nome, descricao, NOW(), NOW() FROM cargos_old;

INSERT INTO departamentos (id, nome, responsavel_id, created_at, updated_at)
SELECT id, nome, responsavel_id, NOW(), NOW() FROM departamentos_old;

INSERT INTO colaboradores (id, nome, email, departamento_id, cargo_id, data_admissao, salario, status, created_at, updated_at)
SELECT id, nome, email, departamento_id, cargo_id, data_admissao, salario, status, NOW(), NOW() FROM colaboradores_old;

-- Atualiza a referência do responsável do departamento após a inserção dos colaboradores
UPDATE departamentos d
SET responsavel_id = c.id
FROM departamentos_old do
JOIN colaboradores_old co ON do.responsavel_id = co.id
JOIN colaboradores c ON c.email = co.email
WHERE d.id = do.id;

INSERT INTO clientes (id, razao_social, nome_fantasia, cnpj, contato_nome, telefone, email, whatsapp, data_aniversario, endereco, cidade, estado, origem, observacoes, status, created_at, updated_at)
SELECT id, razao_social, nome_fantasia, cnpj, contato_nome, telefone, email, whatsapp, data_aniversario, endereco, cidade, estado, origem, observacoes, status, NOW(), NOW() FROM clientes_old;

INSERT INTO fornecedores (id, razao_social, cnpj, email, telefone, status, data_cadastro, created_at, updated_at)
SELECT id, razao_social, cnpj, email, telefone, status, data_cadastro, NOW(), NOW() FROM fornecedores_old;

INSERT INTO produtos_servicos (id, nome, categoria_id, descricao, tipo, preco, status, created_at, updated_at)
SELECT ps.id, ps.nome, ps.categoria_id, ps.descricao, ps.tipo, ps.preco, ps.status, NOW(), NOW()
FROM produtos_servicos_old ps;

INSERT INTO contas_a_pagar (id, fornecedor_id, categoria_id, descricao, valor, data_vencimento, status, data_pagamento, created_at, updated_at)
SELECT id, fornecedor_id, categoria_id, descricao, valor, data_vencimento, status, data_pagamento, NOW(), NOW() FROM contas_a_pagar_old;

INSERT INTO contas_a_receber (id, cliente_id, categoria_id, descricao, valor, data_vencimento, status, data_recebimento, created_at, updated_at)
SELECT id, cliente_id, categoria_id, descricao, valor, data_vencimento, status, data_recebimento, NOW(), NOW() FROM contas_a_receber_old;

INSERT INTO relatorios (id, tipo, periodo_inicio, periodo_fim, dados, created_at, updated_at)
SELECT id, tipo, periodo_inicio, periodo_fim, dados, NOW(), NOW() FROM relatorios_old;

INSERT INTO usuarios (id, nome, email, senha_hash, tipo_usuario, status, created_at, updated_at)
SELECT id, nome, email, senha_hash, tipo_usuario, status, NOW(), NOW() FROM usuarios_old;

-- Fim da migração
