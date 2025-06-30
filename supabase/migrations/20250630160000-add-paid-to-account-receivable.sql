-- Add 'paid' value to account_receivable_status enum for backward compatibility
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'account_receivable_status'::regtype
      AND enumlabel = 'paid'
  ) THEN
    ALTER TYPE account_receivable_status ADD VALUE 'paid';
  END IF;
END;
$$;
