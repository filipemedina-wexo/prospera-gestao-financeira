import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getCurrentClientId } from '@/utils/getCurrentClientId';

export type AccountPayableFromDB = Tables<'accounts_payable'> & {
  financial_clients?: { name: string } | null;
};

export const accountsPayableService = {
  async getAll(): Promise<AccountPayableFromDB[]> {
    const { data, error } = await supabase
      .from('accounts_payable')
      .select('*, financial_clients ( name )')
      .order('due_date');

    if (error) throw new Error(`Erro ao buscar contas a pagar: ${error.message}`);
    return data || [];
  },

  async create(account: Omit<TablesInsert<'accounts_payable'>, 'id' | 'created_at' | 'updated_at' | 'saas_client_id' | 'status'>): Promise<AccountPayableFromDB> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");
    
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Mapeamento de cliente não encontrado.');

    const payload: TablesInsert<'accounts_payable'> = { ...account, saas_client_id: clientId, status: 'pending' };

    const { data, error } = await supabase.from('accounts_payable').insert(payload).select('*, financial_clients ( name )').single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'accounts_payable'>): Promise<AccountPayableFromDB> {
    const { data, error } = await supabase.from('accounts_payable').update(updates).eq('id', id).select('*, financial_clients ( name )').single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('accounts_payable').delete().eq('id', id);
    if (error) throw error;
  },

  async markAsPaid(id: string, paidDate: string): Promise<AccountPayableFromDB> {
    return this.update(id, {
      status: 'paid',
      paid_date: paidDate,
    });
  },
};