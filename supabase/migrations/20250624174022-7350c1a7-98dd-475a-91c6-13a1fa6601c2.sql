
-- 1. Adicionar coluna para extrato de transações na tabela bank_accounts
ALTER TABLE public.bank_accounts 
ADD COLUMN IF NOT EXISTS initial_balance numeric DEFAULT 0;

-- 2. Criar tabela para transações financeiras (extrato)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  saas_client_id uuid NOT NULL,
  bank_account_id uuid REFERENCES public.bank_accounts(id),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric NOT NULL,
  description text NOT NULL,
  category text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  reference_type text, -- 'account_receivable', 'account_payable', 'manual'
  reference_id uuid, -- ID da conta a receber/pagar relacionada
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Criar trigger para atualizar updated_at
CREATE OR REPLACE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Adicionar categorias de receita na tabela client_account_categories
-- (As categorias já existem, mas vamos garantir que há categorias de receita padrão)
INSERT INTO public.client_account_categories (saas_client_id, name, type, is_active)
SELECT 
  sc.id,
  category_data.name,
  category_data.type,
  true
FROM public.saas_clients sc
CROSS JOIN (
  VALUES 
    ('Vendas de Produtos', 'income'),
    ('Prestação de Serviços', 'income'),
    ('Receitas Financeiras', 'income'),
    ('Outras Receitas', 'income')
) AS category_data(name, type)
WHERE NOT EXISTS (
  SELECT 1 FROM public.client_account_categories cac 
  WHERE cac.saas_client_id = sc.id 
  AND cac.name = category_data.name 
  AND cac.type = category_data.type
);

-- 5. Criar função para registrar transação automaticamente quando conta é paga/recebida
CREATE OR REPLACE FUNCTION public.create_financial_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Para contas a receber que foram recebidas
  IF TG_TABLE_NAME = 'accounts_receivable' AND NEW.status = 'received' AND OLD.status != 'received' THEN
    INSERT INTO public.financial_transactions (
      saas_client_id,
      bank_account_id,
      type,
      amount,
      description,
      category,
      transaction_date,
      reference_type,
      reference_id
    ) VALUES (
      NEW.saas_client_id,
      NEW.bank_account_id,
      'income',
      NEW.amount,
      NEW.description,
      NEW.category,
      COALESCE(NEW.received_date, CURRENT_DATE),
      'account_receivable',
      NEW.id
    );
  END IF;

  -- Para contas a pagar que foram pagas
  IF TG_TABLE_NAME = 'accounts_payable' AND NEW.status = 'paid' AND OLD.status != 'paid' THEN
    INSERT INTO public.financial_transactions (
      saas_client_id,
      type,
      amount,
      description,
      category,
      transaction_date,
      reference_type,
      reference_id
    ) VALUES (
      NEW.saas_client_id,
      'expense',
      NEW.amount,
      NEW.description,
      NEW.category,
      COALESCE(NEW.paid_date, CURRENT_DATE),
      'account_payable',
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 6. Criar triggers para registrar transações automaticamente
CREATE OR REPLACE TRIGGER trigger_accounts_receivable_transaction
  AFTER UPDATE ON public.accounts_receivable
  FOR EACH ROW
  EXECUTE FUNCTION public.create_financial_transaction();

CREATE OR REPLACE TRIGGER trigger_accounts_payable_transaction
  AFTER UPDATE ON public.accounts_payable
  FOR EACH ROW
  EXECUTE FUNCTION public.create_financial_transaction();

-- 7. Adicionar RLS policies para financial_transactions
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their client's financial transactions"
  ON public.financial_transactions
  FOR SELECT
  USING (saas_client_id = public.get_current_user_client_id());

CREATE POLICY "Users can create their client's financial transactions"
  ON public.financial_transactions
  FOR INSERT
  WITH CHECK (saas_client_id = public.get_current_user_client_id());

CREATE POLICY "Users can update their client's financial transactions"
  ON public.financial_transactions
  FOR UPDATE
  USING (saas_client_id = public.get_current_user_client_id());

CREATE POLICY "Users can delete their client's financial transactions"
  ON public.financial_transactions
  FOR DELETE
  USING (saas_client_id = public.get_current_user_client_id());
