
-- Inserir role de super_admin para o usuário atual
-- Assumindo que você está logado como o usuário que precisa de acesso super admin
-- Vou usar um email específico que você pode ajustar conforme necessário

-- Primeiro, vamos verificar se o usuário existe e inserir o role de super_admin
-- Substitua 'seu-email@exemplo.com' pelo email do usuário que deve ter acesso super admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE email = 'filipe@medina.com.br'
ON CONFLICT (user_id, role) DO NOTHING;

-- Se o email acima não for o correto, você pode usar este comando alternativo
-- para dar super_admin ao primeiro usuário da tabela:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'super_admin'::app_role
-- FROM auth.users 
-- ORDER BY created_at ASC
-- LIMIT 1
-- ON CONFLICT (user_id, role) DO NOTHING;
