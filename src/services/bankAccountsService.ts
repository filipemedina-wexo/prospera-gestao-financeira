import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type BankAccount = Tables<'bank_accounts'>;

export const bankAccountsService = {
  async getAll(): Promise<BankAccount[]> {
    const { data, error } = await supabase.from('bank_accounts').select('*').eq('is_active', true).order('name');
    if (error) throw error;
    return data || [];
  },
  async create(account: Omit<TablesInsert<'bank_accounts'>, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>): Promise<BankAccount> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    const { data: clientMapping } = await supabase.from('saas_user_client_mapping').select('client_id').eq('user_id', user.id).single();
    if (!clientMapping) throw new Error('Cliente não encontrado');

    const { data, error } = await supabase.from('bank_accounts').insert({ ...account, saas_client_id: clientMapping.client_id }).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, updates: TablesUpdate<'bank_accounts'>): Promise<BankAccount> {
    const { data, error } = await supabase.from('bank_accounts').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
};