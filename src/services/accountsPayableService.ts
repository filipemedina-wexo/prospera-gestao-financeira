import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getCurrentClientId } from '@/utils/getCurrentClientId';

export type AccountPayableFromDB = Tables<'contas_a_pagar'> & {
  fornecedores?: { razao_social: string } | null;
};

export const accountsPayableService = {
  async getAll(): Promise<AccountPayableFromDB[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('contas_a_pagar')
      .select('*, fornecedores ( razao_social )')
      .eq('saas_client_id', clientId)
      .order('data_vencimento');

    if (error) throw new Error(`Erro ao buscar contas a pagar: ${error.message}`);
    return data || [];
  },

  async create(account: Omit<TablesInsert<'contas_a_pagar'>, 'id' | 'created_at' | 'updated_at' | 'saas_client_id' | 'status'>): Promise<AccountPayableFromDB> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");
    
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Mapeamento de cliente não encontrado.');

    const payload: TablesInsert<'contas_a_pagar'> = { ...account, saas_client_id: clientId, status: 'pending' };

    const { data, error } = await supabase.from('contas_a_pagar').insert(payload).select('*, fornecedores ( razao_social )').single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'contas_a_pagar'>): Promise<AccountPayableFromDB> {
    const { data, error } = await supabase.from('contas_a_pagar').update(updates).eq('id', id).select('*, fornecedores ( razao_social )').single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('contas_a_pagar').delete().eq('id', id);
    if (error) throw error;
  },

  async markAsPaid(id: string, paidDate: string): Promise<AccountPayableFromDB> {
    return this.update(id, {
      status: 'paid',
      data_pagamento: paidDate,
    });
  },
};