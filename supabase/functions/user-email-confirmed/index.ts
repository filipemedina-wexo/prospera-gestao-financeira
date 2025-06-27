
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // This function is triggered by the auth webhook when email is confirmed
    const payload = await req.json()
    console.log('Email confirmation webhook payload:', payload)

    // Check if this is an email confirmation event
    if (payload.type !== 'user.email_confirmed') {
      return new Response(
        JSON.stringify({ message: 'Not an email confirmation event' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    const user = payload.user
    if (!user?.id) {
      throw new Error('No user found in payload')
    }

    // Call the welcome email function
    const welcomeEmailResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-welcome-email`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      }
    )

    if (!welcomeEmailResponse.ok) {
      const error = await welcomeEmailResponse.text()
      console.error('Failed to send welcome email:', error)
      throw new Error('Failed to send welcome email')
    }

    const result = await welcomeEmailResponse.json()
    console.log('Welcome email result:', result)

    return new Response(
      JSON.stringify({ message: 'Email confirmation processed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in user-email-confirmed webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
