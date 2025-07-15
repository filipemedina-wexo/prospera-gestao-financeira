-- Implementar plano de correções para contas a pagar e receber

-- 1. Corrigir função validate_account_status para lidar com valores NULL
DROP FUNCTION IF EXISTS public.validate_account_status();

CREATE OR REPLACE FUNCTION public.validate_account_status()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Se o status for NULL, definir um valor padrão
    IF NEW.status IS NULL THEN
        IF TG_TABLE_NAME = 'accounts_payable' THEN
            NEW.status = 'pending'::account_payable_status;
        ELSIF TG_TABLE_NAME = 'accounts_receivable' THEN
            NEW.status = 'pending'::account_receivable_status;
        END IF;
    END IF;
    
    -- Para accounts_payable, apenas permitir: pending, paid, overdue, partial
    IF TG_TABLE_NAME = 'accounts_payable' THEN
        IF NEW.status NOT IN ('pending', 'paid', 'overdue', 'partial') THEN
            RAISE EXCEPTION 'Invalid status "%" for accounts_payable. Valid statuses are: pending, paid, overdue, partial', NEW.status;
        END IF;
    END IF;
    
    -- Para accounts_receivable, apenas permitir: pending, received, overdue, partial, paid
    IF TG_TABLE_NAME = 'accounts_receivable' THEN
        IF NEW.status NOT IN ('pending', 'received', 'overdue', 'partial', 'paid') THEN
            RAISE EXCEPTION 'Invalid status "%" for accounts_receivable. Valid statuses are: pending, received, overdue, partial, paid', NEW.status;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 2. Remover triggers redundantes e manter apenas os necessários
DROP TRIGGER IF EXISTS validate_account_status_trigger ON accounts_payable;
DROP TRIGGER IF EXISTS validate_account_status_trigger ON accounts_receivable;
DROP TRIGGER IF EXISTS sync_financial_transaction_trigger ON accounts_payable;
DROP TRIGGER IF EXISTS sync_financial_transaction_trigger ON accounts_receivable;
DROP TRIGGER IF EXISTS create_financial_transaction_trigger ON accounts_payable;
DROP TRIGGER IF EXISTS create_financial_transaction_trigger ON accounts_receivable;

-- Recriar triggers essenciais
CREATE TRIGGER validate_account_status_trigger
    BEFORE INSERT OR UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION validate_account_status();

CREATE TRIGGER validate_account_status_trigger
    BEFORE INSERT OR UPDATE ON accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION validate_account_status();

CREATE TRIGGER sync_financial_transaction_trigger
    AFTER UPDATE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION sync_financial_transaction_comprehensive();

CREATE TRIGGER sync_financial_transaction_trigger
    AFTER UPDATE ON accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION sync_financial_transaction_comprehensive();

CREATE TRIGGER cleanup_financial_transaction_trigger
    AFTER DELETE ON accounts_payable
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_financial_transaction_comprehensive();

CREATE TRIGGER cleanup_financial_transaction_trigger
    AFTER DELETE ON accounts_receivable
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_financial_transaction_comprehensive();

-- 3. Melhorar função registrar_recebimento com validações adicionais
CREATE OR REPLACE FUNCTION public.registrar_recebimento(
    p_receivable_id uuid, 
    p_received_date date, 
    p_bank_account_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_amount DECIMAL;
    v_saas_client_id UUID;
    v_current_status TEXT;
BEGIN
    -- Validar se todos os parâmetros foram fornecidos
    IF p_receivable_id IS NULL THEN
        RAISE EXCEPTION 'ID da conta a receber é obrigatório';
    END IF;
    
    IF p_received_date IS NULL THEN
        RAISE EXCEPTION 'Data de recebimento é obrigatória';
    END IF;
    
    IF p_bank_account_id IS NULL THEN
        RAISE EXCEPTION 'Conta bancária é obrigatória';
    END IF;
    
    -- Obter status atual para logging
    SELECT status::text INTO v_current_status 
    FROM public.accounts_receivable 
    WHERE id = p_receivable_id;
    
    RAISE NOTICE 'Registering payment for receivable %. Current status: %', p_receivable_id, v_current_status;
    
    -- Validar se a conta bancária existe e pertence ao mesmo cliente
    IF NOT EXISTS (
        SELECT 1 FROM public.bank_accounts ba
        JOIN public.accounts_receivable ar ON ba.saas_client_id = ar.saas_client_id
        WHERE ba.id = p_bank_account_id 
        AND ar.id = p_receivable_id
        AND ba.is_active = true
    ) THEN
        RAISE EXCEPTION 'Conta bancária não encontrada ou não pertence ao mesmo cliente';
    END IF;
    
    -- Atualizar a conta a receber com status correto
    UPDATE public.accounts_receivable
    SET 
        status = 'received'::account_receivable_status,
        received_date = p_received_date,
        bank_account_id = p_bank_account_id,
        updated_at = now()
    WHERE id = p_receivable_id
    RETURNING amount, saas_client_id INTO v_amount, v_saas_client_id;

    IF v_amount IS NULL THEN
        RAISE EXCEPTION 'Conta a receber não encontrada ou acesso negado';
    END IF;

    RAISE NOTICE 'Successfully updated receivable % to received status. Amount: %', p_receivable_id, v_amount;

    -- Atualizar saldo da conta bancária
    UPDATE public.bank_accounts
    SET 
        balance = balance + v_amount,
        updated_at = now()
    WHERE id = p_bank_account_id AND saas_client_id = v_saas_client_id;

    RAISE NOTICE 'Updated bank account % balance by %', p_bank_account_id, v_amount;

    -- A transação financeira será criada automaticamente pelo trigger

END;
$function$;

-- 4. Criar função similar para registrar pagamento
CREATE OR REPLACE FUNCTION public.registrar_pagamento(
    p_payable_id uuid, 
    p_paid_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_amount DECIMAL;
    v_saas_client_id UUID;
    v_current_status TEXT;
BEGIN
    -- Validar se todos os parâmetros foram fornecidos
    IF p_payable_id IS NULL THEN
        RAISE EXCEPTION 'ID da conta a pagar é obrigatório';
    END IF;
    
    IF p_paid_date IS NULL THEN
        RAISE EXCEPTION 'Data de pagamento é obrigatória';
    END IF;
    
    -- Obter status atual para logging
    SELECT status::text INTO v_current_status 
    FROM public.accounts_payable 
    WHERE id = p_payable_id;
    
    RAISE NOTICE 'Registering payment for payable %. Current status: %', p_payable_id, v_current_status;
    
    -- Atualizar a conta a pagar com status correto
    UPDATE public.accounts_payable
    SET 
        status = 'paid'::account_payable_status,
        paid_date = p_paid_date,
        updated_at = now()
    WHERE id = p_payable_id
    RETURNING amount, saas_client_id INTO v_amount, v_saas_client_id;

    IF v_amount IS NULL THEN
        RAISE EXCEPTION 'Conta a pagar não encontrada ou acesso negado';
    END IF;

    RAISE NOTICE 'Successfully updated payable % to paid status. Amount: %', p_payable_id, v_amount;

    -- A transação financeira será criada automaticamente pelo trigger

END;
$function$;

-- 5. Comentar função para documentar uso correto de status
COMMENT ON FUNCTION public.validate_account_status_usage() IS 'Status validation: accounts_receivable uses received, accounts_payable uses paid';