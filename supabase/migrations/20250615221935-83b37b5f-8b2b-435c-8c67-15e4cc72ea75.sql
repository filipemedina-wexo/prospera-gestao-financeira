
-- Primeiro, remover qualquer role super_admin existente do email incorreto
DELETE FROM public.user_roles 
WHERE role = 'super_admin'::app_role 
AND user_id IN (
  SELECT id FROM auth.users WHERE email = 'filipe@medina.com.br'
);

-- Agora, inserir a role super_admin para o usuário correto
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::app_role
FROM auth.users 
WHERE email = 'medina@wexo.com.br'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar se a operação foi bem-sucedida
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
WHERE ur.role = 'super_admin'::app_role;
