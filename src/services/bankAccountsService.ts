import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type BankAccount = Tables<'bank_accounts'>;

export const bankAccountsService = {
  async getAll(): Promise<BankAccount[]> {
    const { data, error } = await supabase.from('bank_accounts').select('*').eq('is_active', true).order('name');
    if (error) throw error;
    return data || [];
  },
  async create(account: TablesInsert<'bank_accounts'>) {
    const { data: clientMapping } = await supabase.from('saas_user_client_mapping').select('client_id').single();
    if (!clientMapping) throw new Error('Cliente não encontrado');
    const { data, error } = await supabase.from('bank_accounts').insert({ ...account, saas_client_id: clientMapping.client_id }).select().single();
    if (error) throw error;
    return data;
  },
};