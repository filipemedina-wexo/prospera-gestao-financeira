import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

interface SeriesItem {
  date: string;
  in: number;
  out: number;
  net: number;
}

interface CashflowResponse {
  in: number;
  out: number;
  net: number;
  series: SeriesItem[];
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const accountId = url.searchParams.get('account_id');

    if (!from || !to) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: from, to' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabase.rpc('cashflow_report', {
      p_from_date: from,
      p_to_date: to,
      p_account_id: accountId
    });

    if (error) {
      console.error('Error fetching cashflow report:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const series: SeriesItem[] = ((data ?? []) as {
      date: string;
      in_amount: string | null;
      out_amount: string | null;
      net_amount: string | null;
    }[]).map((row) => ({
      date: row.date,
      in: parseFloat(row.in_amount ?? '0'),
      out: parseFloat(row.out_amount ?? '0'),
      net: parseFloat(row.net_amount ?? '0')
    }));

    const totalIn = series.reduce((sum, r) => sum + r.in, 0);
    const totalOut = series.reduce((sum, r) => sum + r.out, 0);
    const response: CashflowResponse = {
      in: totalIn,
      out: totalOut,
      net: totalIn - totalOut,
      series
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error generating cashflow report:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
