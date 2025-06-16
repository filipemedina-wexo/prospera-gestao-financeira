
-- Habilitar RLS nas tabelas existentes se ainda não estiver habilitado
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para contas a pagar (drop if exists para evitar erros)
DROP POLICY IF EXISTS "Users can view accounts payable for their client" ON accounts_payable;
DROP POLICY IF EXISTS "Users can create accounts payable for their client" ON accounts_payable;
DROP POLICY IF EXISTS "Users can update accounts payable for their client" ON accounts_payable;
DROP POLICY IF EXISTS "Users can delete accounts payable for their client" ON accounts_payable;

CREATE POLICY "Users can view accounts payable for their client" 
  ON accounts_payable 
  FOR SELECT 
  USING (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

CREATE POLICY "Users can create accounts payable for their client" 
  ON accounts_payable 
  FOR INSERT 
  WITH CHECK (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

CREATE POLICY "Users can update accounts payable for their client" 
  ON accounts_payable 
  FOR UPDATE 
  USING (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

CREATE POLICY "Users can delete accounts payable for their client" 
  ON accounts_payable 
  FOR DELETE 
  USING (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

-- Criar políticas RLS para contas a receber (drop if exists para evitar erros)
DROP POLICY IF EXISTS "Users can view accounts receivable for their client" ON accounts_receivable;
DROP POLICY IF EXISTS "Users can create accounts receivable for their client" ON accounts_receivable;
DROP POLICY IF EXISTS "Users can update accounts receivable for their client" ON accounts_receivable;
DROP POLICY IF EXISTS "Users can delete accounts receivable for their client" ON accounts_receivable;

CREATE POLICY "Users can view accounts receivable for their client" 
  ON accounts_receivable 
  FOR SELECT 
  USING (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

CREATE POLICY "Users can create accounts receivable for their client" 
  ON accounts_receivable 
  FOR INSERT 
  WITH CHECK (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

CREATE POLICY "Users can update accounts receivable for their client" 
  ON accounts_receivable 
  FOR UPDATE 
  USING (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

CREATE POLICY "Users can delete accounts receivable for their client" 
  ON accounts_receivable 
  FOR DELETE 
  USING (
    saas_client_id = public.get_current_user_client_id() OR 
    public.is_super_admin()
  );

-- Habilitar RLS na tabela de categorias se existir
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'client_account_categories') THEN
    ALTER TABLE client_account_categories ENABLE ROW LEVEL SECURITY;
    
    -- Criar políticas RLS para categorias (drop if exists para evitar erros)
    DROP POLICY IF EXISTS "Users can view categories for their client" ON client_account_categories;
    DROP POLICY IF EXISTS "Users can manage categories for their client" ON client_account_categories;

    CREATE POLICY "Users can view categories for their client" 
      ON client_account_categories 
      FOR SELECT 
      USING (
        saas_client_id = public.get_current_user_client_id() OR 
        public.is_super_admin()
      );

    CREATE POLICY "Users can manage categories for their client" 
      ON client_account_categories 
      FOR ALL 
      USING (
        saas_client_id = public.get_current_user_client_id() OR 
        public.is_super_admin()
      )
      WITH CHECK (
        saas_client_id = public.get_current_user_client_id() OR 
        public.is_super_admin()
      );

    -- Inserir categorias padrão para clientes existentes que não as possuem
    INSERT INTO client_account_categories (saas_client_id, name, type)
    SELECT 
      sc.id,
      category_name,
      category_type
    FROM saas_clients sc
    CROSS JOIN (
      VALUES 
        ('Despesas Administrativas', 'expense'),
        ('Despesas com Vendas', 'expense'),
        ('Custo de Mercadorias', 'expense'),
        ('Vendas de Serviços', 'income'),
        ('Vendas de Produtos', 'income'),
        ('Mensalidades', 'income'),
        ('Venda de Projeto', 'income')
    ) AS categories(category_name, category_type)
    WHERE NOT EXISTS (
      SELECT 1 FROM client_account_categories ac 
      WHERE ac.saas_client_id = sc.id 
      AND ac.name = categories.category_name
    );
  END IF;
END $$;
