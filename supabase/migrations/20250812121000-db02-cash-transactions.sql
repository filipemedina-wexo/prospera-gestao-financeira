-- DB-02: Criar tabela de lançamentos do Caixa
CREATE TABLE IF NOT EXISTS cash_transactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    uuid NOT NULL,
  account_id    uuid NOT NULL,
  direction     TEXT NOT NULL CHECK (direction IN ('in','out')),
  amount_dec    NUMERIC(14,2) NOT NULL,
  occurred_at   TIMESTAMPTZ NOT NULL,
  origin_type   TEXT NOT NULL CHECK (origin_type IN ('payable','receivable')),
  origin_id     uuid NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_cash_origin
  ON cash_transactions(origin_type, origin_id);

CREATE INDEX IF NOT EXISTS idx_cash_company
  ON cash_transactions(company_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_cash_account
  ON cash_transactions(account_id, occurred_at DESC);
