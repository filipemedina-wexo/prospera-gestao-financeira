import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY;

export interface CashflowSeriesItem {
  date: string;
  in: number;
  out: number;
  net: number;
}

export interface CashflowReport {
  in: number;
  out: number;
  net: number;
  series: CashflowSeriesItem[];
}

export const reportsService = {
  async getCashflow(
    params: { from: string; to: string; accountId?: string }
  ): Promise<CashflowReport> {
    const url = new URL(`${SUPABASE_URL}/functions/v1/reports-cashflow`);
    url.searchParams.set('from', params.from);
    url.searchParams.set('to', params.to);
    if (params.accountId) {
      url.searchParams.set('account_id', params.accountId);
    }

    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
      }
    });

    if (!res.ok) {
      throw new Error('Erro ao buscar relatório de fluxo de caixa');
    }

    return res.json();
  }
};
