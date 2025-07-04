-- Migration script: restructured financial database
-- This script creates normalized tables with proper constraints and indexes.

-- Tabela de categorias
CREATE TABLE public.categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.categorias IS 'Categorias para produtos, serviços e lançamentos financeiros';
COMMENT ON COLUMN public.categorias.nome IS 'Nome da categoria';

-- Tabela de cargos
CREATE TABLE public.cargos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.cargos IS 'Cargos ou funções dos colaboradores';
COMMENT ON COLUMN public.cargos.nome IS 'Nome do cargo/função';

-- Tabela de departamentos
CREATE TABLE public.departamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    responsavel_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.departamentos IS 'Departamentos da empresa';
COMMENT ON COLUMN public.departamentos.nome IS 'Nome do departamento';

-- Tabela de colaboradores
CREATE TABLE public.colaboradores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    departamento_id INT REFERENCES public.departamentos(id),
    cargo_id INT REFERENCES public.cargos(id),
    data_admissao DATE,
    salario NUMERIC(12,2),
    status VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.colaboradores IS 'Funcionários e colaboradores da empresa';
COMMENT ON COLUMN public.colaboradores.departamento_id IS 'Departamento ao qual o colaborador pertence';
COMMENT ON COLUMN public.colaboradores.cargo_id IS 'Cargo/função do colaborador';

-- Completa a FK de departamentos.responsavel_id para colaboradores
ALTER TABLE public.departamentos
    ADD CONSTRAINT departamentos_responsavel_fk FOREIGN KEY (responsavel_id)
    REFERENCES public.colaboradores(id);

-- Tabela de clientes
CREATE TABLE public.clientes (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE,
    contato_nome VARCHAR(255),
    telefone VARCHAR(20),
    email VARCHAR(255),
    whatsapp VARCHAR(20),
    data_aniversario DATE,
    endereco VARCHAR(255),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    origem VARCHAR(100),
    observacoes TEXT,
    status VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.clientes IS 'Clientes atendidos pela empresa';
COMMENT ON COLUMN public.clientes.cnpj IS 'Número do CNPJ do cliente';

-- Tabela de fornecedores
CREATE TABLE public.fornecedores (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    email VARCHAR(255),
    telefone VARCHAR(20),
    status VARCHAR(10),
    data_cadastro DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.fornecedores IS 'Fornecedores cadastrados';

-- Produtos e serviços
CREATE TABLE public.produtos_servicos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    categoria_id INT REFERENCES public.categorias(id),
    descricao TEXT,
    tipo VARCHAR(20),
    preco NUMERIC(12,2),
    status VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.produtos_servicos IS 'Itens comercializados (produtos ou serviços)';

-- Contas a pagar
CREATE TABLE public.contas_a_pagar (
    id SERIAL PRIMARY KEY,
    fornecedor_id INT REFERENCES public.fornecedores(id),
    categoria_id INT REFERENCES public.categorias(id),
    descricao TEXT,
    valor NUMERIC(12,2),
    data_vencimento DATE,
    status VARCHAR(10),
    data_pagamento DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.contas_a_pagar IS 'Lançamentos de contas a pagar';

-- Contas a receber
CREATE TABLE public.contas_a_receber (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES public.clientes(id),
    categoria_id INT REFERENCES public.categorias(id),
    descricao TEXT,
    valor NUMERIC(12,2),
    data_vencimento DATE,
    status VARCHAR(10),
    data_recebimento DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.contas_a_receber IS 'Lançamentos de contas a receber';

-- Relatórios
CREATE TABLE public.relatorios (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    periodo_inicio DATE,
    periodo_fim DATE,
    dados JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.relatorios IS 'Armazenamento de relatórios gerados';

-- Usuários do sistema
CREATE TABLE public.usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20),
    status VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.usuarios IS 'Usuários que acessam o sistema';

-- Índices para performance
CREATE INDEX idx_colaboradores_departamento ON public.colaboradores(departamento_id);
CREATE INDEX idx_colaboradores_cargo ON public.colaboradores(cargo_id);
CREATE INDEX idx_produtos_servicos_categoria ON public.produtos_servicos(categoria_id);
CREATE INDEX idx_contas_pagar_fornecedor ON public.contas_a_pagar(fornecedor_id);
CREATE INDEX idx_contas_pagar_categoria ON public.contas_a_pagar(categoria_id);
CREATE INDEX idx_contas_receber_cliente ON public.contas_a_receber(cliente_id);
CREATE INDEX idx_contas_receber_categoria ON public.contas_a_receber(categoria_id);
CREATE INDEX idx_clientes_cnpj ON public.clientes(cnpj);
CREATE INDEX idx_fornecedores_cnpj ON public.fornecedores(cnpj);

