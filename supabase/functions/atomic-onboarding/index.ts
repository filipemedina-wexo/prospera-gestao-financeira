import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OnboardingRequest {
  email: string;
  password: string;
  company_name: string;
  contact_name: string;
  contact_phone?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
}

interface OnboardingResponse {
  success: boolean;
  message: string;
  client_id?: string;
  user_id?: string;
  temporary_password?: string;
  error?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestBody: OnboardingRequest = await req.json();
    
    const {
      email,
      password,
      company_name,
      contact_name,
      contact_phone,
      cnpj,
      address,
      city,
      state
    } = requestBody;

    // Validate required fields
    if (!email || !password || !company_name || !contact_name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: email, password, company_name, contact_name' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Starting atomic onboarding for:', email);

    // Start a transaction-like operation
    // Step 1: Create new SaaS client
    const { data: saasClient, error: clientError } = await supabase
      .from('saas_clients')
      .insert({
        company_name,
        contact_name,
        contact_email: email,
        contact_phone,
        cnpj,
        address,
        city,
        state,
        status: 'trial'
      })
      .select()
      .single();

    if (clientError) {
      console.error('Error creating SaaS client:', clientError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create client: ' + clientError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Created SaaS client:', saasClient.id);

    // Step 2: Create user in auth system
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: contact_name,
        company_name,
        client_id: saasClient.id
      },
      email_confirm: true
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      
      // Rollback: Delete the created client
      await supabase.from('saas_clients').delete().eq('id', saasClient.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create user: ' + authError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Created auth user:', authUser.user.id);

    // Step 3: Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: contact_name
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      
      // Rollback: Delete user and client
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from('saas_clients').delete().eq('id', saasClient.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create profile: ' + profileError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 4: Get or create basic plan
    let { data: basicPlan, error: planError } = await supabase
      .from('saas_plans')
      .select('*')
      .eq('name', 'Plano Básico')
      .single();

    if (planError || !basicPlan) {
      console.log('Creating basic plan');
      const { data: newPlan, error: createPlanError } = await supabase
        .from('saas_plans')
        .insert({
          name: 'Plano Básico',
          description: 'Plano básico para gestão financeira',
          type: 'basic',
          monthly_price: 99.00,
          yearly_price: 990.00,
          max_users: 5,
          features: [
            'Dashboard',
            'Contas a Pagar',
            'Contas a Receber',
            'Relatórios Básicos'
          ],
          is_active: true
        })
        .select()
        .single();

      if (createPlanError) {
        console.error('Error creating basic plan:', createPlanError);
        
        // Rollback
        await supabase.auth.admin.deleteUser(authUser.user.id);
        await supabase.from('saas_clients').delete().eq('id', saasClient.id);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to create basic plan: ' + createPlanError.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      basicPlan = newPlan;
    }

    // Step 5: Create subscription
    const { error: subscriptionError } = await supabase
      .from('saas_subscriptions')
      .insert({
        client_id: saasClient.id,
        plan_id: basicPlan.id,
        status: 'trial',
        billing_cycle: 'monthly',
        monthly_price: 99.00,
        yearly_price: 990.00,
        start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew: true
      });

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      
      // Rollback
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from('saas_clients').delete().eq('id', saasClient.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create subscription: ' + subscriptionError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 6: Create user-client mapping
    const { error: mappingError } = await supabase
      .from('saas_user_client_mapping')
      .insert({
        user_id: authUser.user.id,
        client_id: saasClient.id,
        role: 'admin',
        is_active: true
      });

    if (mappingError) {
      console.error('Error creating user-client mapping:', mappingError);
      
      // Rollback
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from('saas_clients').delete().eq('id', saasClient.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create user-client mapping: ' + mappingError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 7: Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'admin'
      });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      
      // Rollback
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from('saas_clients').delete().eq('id', saasClient.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create user role: ' + roleError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 8: Initialize client data using the existing function
    const { error: initError } = await supabase.rpc('initialize_client_data', {
      client_id_param: saasClient.id
    });

    if (initError) {
      console.error('Error initializing client data:', initError);
      
      // Rollback
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from('saas_clients').delete().eq('id', saasClient.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to initialize client data: ' + initError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 9: Create onboarding record
    const { error: onboardingError } = await supabase
      .from('client_onboarding')
      .insert({
        client_id: saasClient.id,
        setup_completed: false,
        admin_user_created: true,
        initial_data_created: true,
        welcome_email_sent: false
      });

    if (onboardingError) {
      console.error('Error creating onboarding record:', onboardingError);
      
      // Rollback
      await supabase.auth.admin.deleteUser(authUser.user.id);
      await supabase.from('saas_clients').delete().eq('id', saasClient.id);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to create onboarding record: ' + onboardingError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 10: Log successful onboarding
    const { error: logError } = await supabase
      .from('security_audit_log')
      .insert({
        user_id: authUser.user.id,
        action: 'ATOMIC_ONBOARDING_SUCCESS',
        resource_type: 'saas_client',
        resource_id: saasClient.id,
        success: true,
        metadata: {
          client_id: saasClient.id,
          user_email: email,
          company_name: company_name,
          onboarding_timestamp: new Date().toISOString()
        }
      });

    if (logError) {
      console.error('Error logging onboarding:', logError);
      // Don't rollback for logging errors, just log and continue
    }

    console.log('Atomic onboarding completed successfully for:', email);

    const response: OnboardingResponse = {
      success: true,
      message: 'Onboarding completed successfully',
      client_id: saasClient.id,
      user_id: authUser.user.id
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Atomic onboarding error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error: ' + error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});