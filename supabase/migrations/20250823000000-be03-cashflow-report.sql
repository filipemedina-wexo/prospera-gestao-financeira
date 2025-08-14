-- BE-03: Função para relatório de fluxo de caixa
CREATE OR REPLACE FUNCTION public.cashflow_report(
    p_from_date date,
    p_to_date date,
    p_account_id uuid DEFAULT NULL
)
RETURNS TABLE(
    date date,
    in_amount numeric,
    out_amount numeric,
    net_amount numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT
        d::date AS date,
        COALESCE(SUM(CASE WHEN ct.direction = 'in' THEN ct.amount_dec END),0) AS in_amount,
        COALESCE(SUM(CASE WHEN ct.direction = 'out' THEN ct.amount_dec END),0) AS out_amount,
        COALESCE(SUM(CASE WHEN ct.direction = 'in' THEN ct.amount_dec ELSE -ct.amount_dec END),0) AS net_amount
    FROM generate_series(p_from_date, p_to_date, '1 day') AS d
    LEFT JOIN cash_transactions ct
        ON ct.occurred_at::date = d::date
        AND (p_account_id IS NULL OR ct.account_id = p_account_id)
    GROUP BY d
    ORDER BY d;
$$;
