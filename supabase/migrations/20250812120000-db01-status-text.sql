-- DB-01: Migrar status de contas a pagar e receber para TEXT com CHECK e índices

-- 1) Renomear colunas antigas
ALTER TABLE accounts_payable    RENAME COLUMN status TO status_old;
ALTER TABLE accounts_receivable RENAME COLUMN status TO status_old;

-- 2) Criar novas colunas TEXT + CHECK
ALTER TABLE accounts_payable
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
  ADD CONSTRAINT chk_ap_status CHECK (status IN ('pending','overdue','paid','canceled'));
ALTER TABLE accounts_receivable
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
  ADD CONSTRAINT chk_ar_status CHECK (status IN ('pending','overdue','received','canceled'));

-- 3) Migrar valores
UPDATE accounts_payable
SET status = CASE lower(coalesce(status_old::text,'pending'))
  WHEN 'pending'   THEN 'pending'
  WHEN 'overdue'   THEN 'overdue'
  WHEN 'paid'      THEN 'paid'
  WHEN 'received'  THEN 'paid'     -- corrigindo erro legado
  WHEN 'null'      THEN 'pending'
  ELSE 'pending'
END;

UPDATE accounts_receivable
SET status = CASE lower(coalesce(status_old::text,'pending'))
  WHEN 'pending'   THEN 'pending'
  WHEN 'overdue'   THEN 'overdue'
  WHEN 'received'  THEN 'received'
  WHEN 'paid'      THEN 'received' -- corrigindo erro legado
  WHEN 'null'      THEN 'pending'
  ELSE 'pending'
END;

-- 4) Remover colunas antigas
ALTER TABLE accounts_payable    DROP COLUMN status_old;
ALTER TABLE accounts_receivable DROP COLUMN status_old;

-- 5) Índices
CREATE INDEX IF NOT EXISTS idx_ap_status ON accounts_payable(status);
CREATE INDEX IF NOT EXISTS idx_ar_status ON accounts_receivable(status);
