-- Add test data for financial reports

-- Mock saas_client_id
-- In a real scenario, this would be a valid UUID from the clients table
DO $$
DECLARE
    client_id UUID := '7a8a8e8e-8a8a-8a8a-8a8a-8a8a8a8a8a8a';
BEGIN
    -- Ensure the client exists, or insert a placeholder
    IF NOT EXISTS (SELECT 1 FROM clients WHERE id = client_id) THEN
        INSERT INTO clients (id, company_name, status)
        VALUES (client_id, 'Cliente Teste Relatórios', 'active');
    END IF;

    -- Insert test data for accounts_receivable
    INSERT INTO accounts_receivable (description, amount, due_date, status, category, received_date, saas_client_id) VALUES
    ('Venda de Produto A', 1500.00, NOW() - INTERVAL '10 days', 'received', 'Vendas', NOW() - INTERVAL '5 days', client_id),
    ('Serviço de Consultoria', 3500.00, NOW() + INTERVAL '15 days', 'pending', 'Serviços', NULL, client_id),
    ('Venda de Produto B', 800.00, NOW() - INTERVAL '2 days', 'overdue', 'Vendas', NULL, client_id);

    -- Insert test data for accounts_payable
    INSERT INTO accounts_payable (description, amount, due_date, status, category, paid_date, saas_client_id) VALUES
    ('Compra de Material de Escritório', 250.00, NOW() - INTERVAL '8 days', 'paid', 'Despesas Administrativas', NOW() - INTERVAL '3 days', client_id),
    ('Pagamento de Fornecedor X', 1200.00, NOW() + INTERVAL '10 days', 'pending', 'Compras', NULL, client_id),
    ('Assinatura de Software', 150.00, NOW() - INTERVAL '1 day', 'paid', 'Tecnologia', NOW(), client_id);

END $$;
