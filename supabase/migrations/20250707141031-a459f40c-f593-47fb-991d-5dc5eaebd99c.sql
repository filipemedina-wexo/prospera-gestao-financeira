-- Migração para reestruturação completa do banco de dados
-- Seguindo melhores práticas relacionais

-- 1. Criar tabela de categorias (para produtos, serviços e lançamentos)
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

-- 5. Adicionar FK de manager para departments
ALTER TABLE public.departments 
ADD CONSTRAINT departments_manager_fk 
FOREIGN KEY (manager_id) REFERENCES public.employees(id);

-- 6. Criar tabela de clientes (renomear financial_clients para clients)
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
    UNIQUE(saas_client_id, client_code),
    UNIQUE(saas_client_id, document_number)
);

-- 7. Criar tabela de produtos e serviços
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

-- 8. Atualizar tabela accounts_payable para usar nova estrutura
ALTER TABLE public.accounts_payable 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS document_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_frequency VARCHAR(20) CHECK (recurrence_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_count INTEGER,
ADD COLUMN IF NOT EXISTS recurrence_group_id UUID;

-- 9. Atualizar tabela accounts_receivable para usar nova estrutura  
ALTER TABLE public.accounts_receivable
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id),
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id),
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_frequency VARCHAR(20) CHECK (recurrence_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_count INTEGER,
ADD COLUMN IF NOT EXISTS recurrence_group_id UUID;

-- 10. Criar tabela de relatórios
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

-- 11. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_categories_saas_client_type ON public.categories(saas_client_id, type);
CREATE INDEX IF NOT EXISTS idx_departments_saas_client ON public.departments(saas_client_id);
CREATE INDEX IF NOT EXISTS idx_positions_saas_client ON public.positions(saas_client_id);
CREATE INDEX IF NOT EXISTS idx_employees_saas_client ON public.employees(saas_client_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(saas_client_id, status);
CREATE INDEX IF NOT EXISTS idx_clients_saas_client ON public.clients(saas_client_id);
CREATE INDEX IF NOT EXISTS idx_clients_type ON public.clients(saas_client_id, client_type);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(saas_client_id, status);
CREATE INDEX IF NOT EXISTS idx_products_services_saas_client ON public.products_services(saas_client_id);
CREATE INDEX IF NOT EXISTS idx_products_services_category ON public.products_services(category_id);
CREATE INDEX IF NOT EXISTS idx_products_services_type ON public.products_services(saas_client_id, type);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_client ON public.accounts_payable(client_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_category ON public.accounts_payable(category_id);
CREATE INDEX IF NOT EXISTS idx_accounts_payable_due_date ON public.accounts_payable(saas_client_id, due_date);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_client ON public.accounts_receivable(client_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_category ON public.accounts_receivable(category_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_due_date ON public.accounts_receivable(saas_client_id, due_date);
CREATE INDEX IF NOT EXISTS idx_reports_saas_client_type ON public.reports(saas_client_id, type);
CREATE INDEX IF NOT EXISTS idx_reports_period ON public.reports(saas_client_id, period_start, period_end);

-- 12. Criar triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_services_updated_at BEFORE UPDATE ON public.products_services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Habilitar RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 14. Criar políticas RLS
-- Categories
CREATE POLICY "Users can manage categories for their client" ON public.categories
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

-- Departments
CREATE POLICY "Users can manage departments for their client" ON public.departments
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

-- Positions
CREATE POLICY "Users can manage positions for their client" ON public.positions
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

-- Employees
CREATE POLICY "Users can manage employees for their client" ON public.employees
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

-- Clients
CREATE POLICY "Users can manage clients for their client" ON public.clients
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

-- Products/Services
CREATE POLICY "Users can manage products/services for their client" ON public.products_services
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

-- Reports
CREATE POLICY "Users can manage reports for their client" ON public.reports
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

-- 15. Criar função para migrar dados da financial_clients para clients
CREATE OR REPLACE FUNCTION migrate_financial_clients_to_clients()
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.clients (
        id, saas_client_id, company_name, contact_email, contact_phone, 
        document_number, address, city, state, zip_code, client_type, 
        created_at, updated_at
    )
    SELECT 
        id, saas_client_id, name, email, phone, 
        document, address, city, state, cep, 'both',
        created_at, updated_at
    FROM public.financial_clients
    WHERE NOT EXISTS (
        SELECT 1 FROM public.clients c WHERE c.id = financial_clients.id
    );
END;
$$ LANGUAGE plpgsql;

-- Executar migração dos dados
SELECT migrate_financial_clients_to_clients();

-- 16. Atualizar referências nas tabelas accounts_payable e accounts_receivable
UPDATE public.accounts_payable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

UPDATE public.accounts_receivable 
SET client_id = financial_client_id 
WHERE client_id IS NULL AND financial_client_id IS NOT NULL;

-- 17. Comentários para documentação
COMMENT ON TABLE public.categories IS 'Categorias para produtos, serviços e lançamentos financeiros';
COMMENT ON TABLE public.departments IS 'Departamentos da empresa';
COMMENT ON TABLE public.positions IS 'Cargos/posições dos funcionários';
COMMENT ON TABLE public.employees IS 'Funcionários da empresa';
COMMENT ON TABLE public.clients IS 'Clientes e fornecedores unificados';
COMMENT ON TABLE public.products_services IS 'Produtos e serviços oferecidos';
COMMENT ON TABLE public.reports IS 'Relatórios gerados pelo sistema';