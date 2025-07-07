-- Etapa 1: Criar tabelas básicas primeiro

-- 1. Criar tabela de categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('product', 'service', 'income', 'expense')),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(saas_client_id, name, type)
);

-- 2. Criar tabela de departamentos
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id UUID, -- FK será adicionada após criar employees
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(saas_client_id, name)
);

-- 3. Criar tabela de cargos/posições
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_salary DECIMAL(12,2),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(saas_client_id, name)
);

-- 4. Criar tabela de funcionários
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    employee_number VARCHAR(20),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    document_number VARCHAR(20), -- CPF
    birth_date DATE,
    hire_date DATE NOT NULL,
    termination_date DATE,
    department_id UUID REFERENCES public.departments(id),
    position_id UUID REFERENCES public.positions(id),
    salary DECIMAL(12,2),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vacation', 'leave')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(saas_client_id, employee_number),
    UNIQUE(saas_client_id, email)
);

-- 5. Criar tabela de clientes unificada
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    client_code VARCHAR(20),
    client_type VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (client_type IN ('customer', 'supplier', 'both')),
    company_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    document_number VARCHAR(20), -- CNPJ/CPF
    state_registration VARCHAR(20),
    municipal_registration VARCHAR(20),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    whatsapp VARCHAR(20),
    website VARCHAR(255),
    birth_date DATE, -- para pessoa física
    anniversary_date DATE, -- para empresa
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'Brasil',
    credit_limit DECIMAL(12,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 30, -- dias
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(saas_client_id, client_code)
);

-- 6. Criar tabela de produtos e serviços
CREATE TABLE IF NOT EXISTS public.products_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    code VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('product', 'service')),
    category_id UUID REFERENCES public.categories(id),
    unit_of_measure VARCHAR(20),
    cost_price DECIMAL(12,2) DEFAULT 0,
    sale_price DECIMAL(12,2) DEFAULT 0,
    stock_quantity DECIMAL(12,3) DEFAULT 0,
    minimum_stock DECIMAL(12,3) DEFAULT 0,
    maximum_stock DECIMAL(12,3) DEFAULT 0,
    barcode VARCHAR(50),
    ncm_code VARCHAR(20), -- Nomenclatura Comum do Mercosul
    tax_rate DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(saas_client_id, code),
    UNIQUE(saas_client_id, barcode)
);

-- 7. Criar tabela de relatórios
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'cash_flow', 'profit_loss', 'balance_sheet', 'custom'
    description TEXT,
    parameters JSONB, -- parâmetros do relatório (filtros, período, etc.)
    data JSONB, -- dados calculados do relatório
    period_start DATE,
    period_end DATE,
    generated_by UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    error_message TEXT,
    file_path TEXT, -- caminho do arquivo gerado (PDF, Excel, etc.)
    is_scheduled BOOLEAN DEFAULT false,
    schedule_frequency VARCHAR(20), -- para relatórios automáticos
    next_run_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);