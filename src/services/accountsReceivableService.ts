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

    if (error) throw new Error(`Erro ao buscar contas a receber: ${error.message}`);
    return data || [];
  },

  async create(account: Omit<TablesInsert<'accounts_receivable'>, 'id' | 'created_at' | 'updated_at' | 'saas_client_id' | 'status'>): Promise<AccountReceivableFromDB> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");
    
    const { data: clientMapping, error: mappingError } = await supabase.from('saas_user_client_mapping').select('client_id').eq('user_id', user.id).single();
    if (mappingError || !clientMapping) throw new Error('Mapeamento de cliente não encontrado.');

    const payload: TablesInsert<'accounts_receivable'> = { ...account, saas_client_id: clientMapping.client_id, status: 'pending' };

    const { data, error } = await supabase.from('accounts_receivable').insert(payload).select('*, financial_clients ( name )').single();
    if (error) { console.error("Supabase error details:", error); throw new Error(`Erro ao criar conta a receber: ${error.message}`); }
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

  async markAsReceived(id: string, receivedDate: string, bankAccountId: string): Promise<void> {
    // CORREÇÃO APLICADA AQUI
    const { error } = await supabase.rpc('registrar_recebimento', {
      p_receivable_id: id,
      p_received_date: receivedDate,
      p_bank_account_id: bankAccountId
    });
    
    if (error) {
      console.error("Erro ao registrar recebimento via RPC:", error);
      throw error;
    }
  },
};