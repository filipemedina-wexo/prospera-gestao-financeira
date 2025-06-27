
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
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

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    const { user, temporaryPassword } = await req.json()
    
    if (!user?.id || !user?.email) {
      throw new Error('User ID and email are required')
    }

    console.log('Processing welcome email for user:', user.email)

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

    // Get the current domain for login link
    const loginUrl = `${Deno.env.get('BASE_URL') ?? Deno.env.get('SUPABASE_URL')?.replace('/v1', '') || 'https://localhost:5173'}/login`

    // Send welcome email using Resend
    const emailContent = {
      to: user.email,
      subject: 'Bem-vindo(a) ao Sistema Prospera!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Bem-vindo(a) ao Sistema Prospera!</h1>
            <p style="color: #666; font-size: 16px;">Sua conta foi criada com sucesso</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-top: 0;">Seus dados de acesso:</h2>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 10px 0;"><strong>Senha temporária:</strong> <code style="background-color: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${temporaryPassword}</code></p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Acessar Sistema
            </a>
          </div>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Importante:</strong> Por motivos de segurança, altere sua senha após o primeiro login.</p>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Se você não criou esta conta, pode ignorar este email com segurança.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            Sistema Prospera - Gestão Empresarial Inteligente
          </p>
        </div>
      `
    }

    const { data: emailResult, error: emailError } = await resend.emails.send({
      from: 'Sistema Prospera <onboarding@resend.dev>',
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (emailError) {
      console.error('Error sending email via Resend:', emailError)
      throw new Error(`Failed to send email: ${emailError.message}`)
    }

    console.log('Email sent successfully via Resend:', emailResult)

    // Update profile to mark welcome email as sent
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ welcome_email_sent: true })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      // Don't throw here as email was sent successfully
    }

    return new Response(
      JSON.stringify({ 
        message: 'Welcome email sent successfully',
        email: emailContent.to,
        emailId: emailResult?.id
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
