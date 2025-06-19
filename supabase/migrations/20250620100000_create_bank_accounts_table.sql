CREATE TABLE public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saas_client_id UUID NOT NULL REFERENCES public.saas_clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bank_name TEXT,
    agency TEXT,
    account_number TEXT,
    type TEXT CHECK (type IN ('corrente', 'poupanca', 'investimento')),
    initial_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bank accounts" ON public.bank_accounts
FOR ALL USING (saas_client_id = public.get_current_user_client_id());