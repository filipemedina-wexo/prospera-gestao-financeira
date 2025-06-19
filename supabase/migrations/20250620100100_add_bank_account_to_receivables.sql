ALTER TABLE public.accounts_receivable
ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts(id);