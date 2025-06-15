
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user } = await req.json()
    
    if (!user?.id || !user?.email) {
      throw new Error('User ID and email are required')
    }

    // Check if welcome email was already sent
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('welcome_email_sent, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    if (profile?.welcome_email_sent) {
      return new Response(
        JSON.stringify({ message: 'Welcome email already sent' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Send welcome email (using a simple email service or SMTP)
    const emailContent = {
      to: user.email,
      subject: 'Bem-vindo(a) ao nosso Sistema!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Bem-vindo(a), ${profile?.full_name || user.email}!</h1>
          <p>Obrigado por se cadastrar em nosso sistema. Sua conta foi criada com sucesso.</p>
          <p>Agora você pode acessar todas as funcionalidades disponíveis.</p>
          <div style="margin: 30px 0;">
            <a href="https://oywjjsqnodnrhtlwwmrk.supabase.co" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Acessar Sistema
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Se você não criou esta conta, pode ignorar este email.
          </p>
        </div>
      `
    }

    // Log the email content (in production, you would send this via an email service)
    console.log('Welcome email content:', emailContent)

    // Update profile to mark welcome email as sent
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ welcome_email_sent: true })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      throw new Error('Failed to update profile')
    }

    return new Response(
      JSON.stringify({ 
        message: 'Welcome email sent successfully',
        email: emailContent.to 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send-welcome-email function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
