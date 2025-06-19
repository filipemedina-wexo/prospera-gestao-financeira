import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type AccountReceivableFromDB = Tables<'accounts_receivable'> & {
  financial_clients?: { name: string } | null;
};

export const accountsReceivableService = {
  async getAll(): Promise<AccountReceivableFromDB[]> {
    const { data, error } = await supabase
      .from('accounts_receivable')
      .select('*, financial_clients ( name )')
      .order('due_date');
    if (error) throw error;
    return data || [];
  },

  async create(account: Omit<TablesInsert<'accounts_receivable'>, 'id' | 'created_at' | 'updated_at' | 'saas_client_id' | 'status'>): Promise<AccountReceivableFromDB> {
    const { data: clientMapping } = await supabase.from('saas_user_client_mapping').select('client_id').single();
    if (!clientMapping) throw new Error('Cliente não encontrado');
    const { data, error } = await supabase
      .from('accounts_receivable')
      .insert({ ...account, saas_client_id: clientMapping.client_id })
      .select('*, financial_clients ( name )')
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'accounts_receivable'>): Promise<AccountReceivableFromDB> {
    const { data, error } = await supabase.from('accounts_receivable').update(updates).eq('id', id).select('*, financial_clients ( name )').single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('accounts_receivable').delete().eq('id', id);
    if (error) throw error;
  },

  async markAsReceived(id: string, receivedDate: string, bankAccountId: string): Promise<AccountReceivableFromDB> {
    return this.update(id, {
      status: 'received',
      received_date: receivedDate,
      bank_account_id: bankAccountId,
    });
  },
};