-- Etapa 2: Configurar relacionamentos, índices, RLS e migração de dados

-- 1. Adicionar FK de manager para departments
ALTER TABLE public.departments 
ADD CONSTRAINT departments_manager_fk 
FOREIGN KEY (manager_id) REFERENCES public.employees(id);

-- 2. Atualizar tabelas existentes com novas colunas
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

-- 3. Criar índices para performance
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

-- 4. Habilitar RLS em todas as novas tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS
CREATE POLICY "Users can manage categories for their client" ON public.categories
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can manage departments for their client" ON public.departments
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can manage positions for their client" ON public.positions
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can manage employees for their client" ON public.employees
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can manage clients for their client" ON public.clients
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can manage products/services for their client" ON public.products_services
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());

CREATE POLICY "Users can manage reports for their client" ON public.reports
FOR ALL USING (saas_client_id = get_current_user_client_id() OR is_super_admin());