import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getCurrentClientId } from '@/utils/getCurrentClientId';

export type AccountReceivableFromDB = Tables<'contas_a_receber'> & {
  fornecedores?: { razao_social: string } | null;
};

export const accountsReceivableService = {
  async getAll(): Promise<AccountReceivableFromDB[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('contas_a_receber')
      .select('*, fornecedores ( razao_social )')
      .eq('saas_client_id', clientId)
      .order('data_vencimento');

    if (error) throw new Error(`Erro ao buscar contas a receber: ${error.message}`);
    return data || [];
  },

  async create(account: Omit<TablesInsert<'contas_a_receber'>, 'id' | 'created_at' | 'updated_at' | 'saas_client_id' | 'status'>): Promise<AccountReceivableFromDB> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");
    
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Mapeamento de cliente não encontrado.');

    const payload: TablesInsert<'contas_a_receber'> = { ...account, saas_client_id: clientId, status: 'pending' };

    const { data, error } = await supabase.from('contas_a_receber').insert(payload).select('*, fornecedores ( razao_social )').single();
    if (error) { console.error("Supabase error details:", error); throw new Error(`Erro ao criar conta a receber: ${error.message}`); }
    return data;
  },

  async update(id: string, updates: TablesUpdate<'contas_a_receber'>): Promise<AccountReceivableFromDB> {
    const { data, error } = await supabase.from('contas_a_receber').update(updates).eq('id', id).select('*, fornecedores ( razao_social )').single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contas_a_receber').delete().eq('id', id);
    if (error) throw error;
  },

  async markAsReceived(id: string, receivedDate: string, bankAccountId: string): Promise<void> {
    const { error } = await supabase.rpc('registrar_recebimento', {
      p_receivable_id: id,
      p_received_date: receivedDate,
      p_bank_account_id: bankAccountId
    });
    
    if (error) {
      console.error("Erro ao registrar recebimento via RPC:", error);
      throw new Error(`Erro ao registrar recebimento: ${error.message}`);
    }
  },
};