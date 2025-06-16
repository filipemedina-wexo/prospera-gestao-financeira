
-- Criar função para inicializar um novo cliente SaaS quando um usuário se registra
CREATE OR REPLACE FUNCTION public.create_new_client_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_client_id UUID;
  basic_plan_id UUID;
BEGIN
  -- Verificar se é um novo usuário (não super admin)
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = NEW.id AND role = 'super_admin'
  ) THEN
    
    -- Criar novo cliente SaaS
    INSERT INTO public.saas_clients (
      company_name,
      contact_name,
      contact_email,
      status
    ) VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Empresa de ' || NEW.email),
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.email,
      'trial'
    ) RETURNING id INTO new_client_id;
    
    -- Buscar plano básico
    SELECT id INTO basic_plan_id 
    FROM public.saas_plans 
    WHERE name = 'Plano Básico' 
    LIMIT 1;
    
    -- Se não encontrar plano básico, criar um
    IF basic_plan_id IS NULL THEN
      INSERT INTO public.saas_plans (
        name,
        description,
        type,
        monthly_price,
        yearly_price,
        max_users,
        features,
        is_active
      ) VALUES (
        'Plano Básico',
        'Plano básico para gestão financeira',
        'basic',
        99.00,
        990.00,
        5,
        '["Dashboard", "Contas a Pagar", "Contas a Receber", "Relatórios Básicos"]'::jsonb,
        true
      ) RETURNING id INTO basic_plan_id;
    END IF;
    
    -- Criar assinatura para o novo cliente
    INSERT INTO public.saas_subscriptions (
      client_id,
      plan_id,
      status,
      billing_cycle,
      monthly_price,
      yearly_price,
      start_date,
      trial_end_date,
      auto_renew
    ) VALUES (
      new_client_id,
      basic_plan_id,
      'trial',
      'monthly',
      99.00,
      990.00,
      now(),
      now() + interval '30 days',
      true
    );
    
    -- Associar usuário ao cliente como admin
    INSERT INTO public.saas_user_client_mapping (
      user_id,
      client_id,
      role,
      is_active
    ) VALUES (
      NEW.id,
      new_client_id,
      'admin',
      true
    );
    
    -- Definir role do usuário como admin
    INSERT INTO public.user_roles (
      user_id,
      role
    ) VALUES (
      NEW.id,
      'admin'
    );
    
    -- Inicializar configurações do cliente
    PERFORM public.initialize_client_data(new_client_id);
    
    -- Criar registro de onboarding
    INSERT INTO public.client_onboarding (
      client_id,
      setup_completed,
      admin_user_created,
      initial_data_created
    ) VALUES (
      new_client_id,
      false,
      true,
      true
    );
    
    -- Log da criação do cliente
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      resource_type,
      resource_id,
      success,
      metadata
    ) VALUES (
      NEW.id,
      'AUTO_CLIENT_CREATION',
      'saas_client',
      new_client_id::text,
      true,
      jsonb_build_object(
        'client_id', new_client_id,
        'user_email', NEW.email,
        'auto_created', true
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar após inserção de novo usuário
DROP TRIGGER IF EXISTS on_auth_user_client_creation ON auth.users;
CREATE TRIGGER on_auth_user_client_creation
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_new_client_for_user();

-- Atualizar função handle_new_user para não conflitar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Apenas criar o perfil, o cliente será criado pelo outro trigger
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;
