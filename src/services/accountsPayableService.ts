import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getCurrentClientId } from '@/utils/getCurrentClientId';
import { logStatusOperation } from '@/utils/statusLogger';

export type AccountPayableFromDB = Tables<'accounts_payable'> & {
  clients?: { company_name: string } | null;
};

export const accountsPayableService = {
  async getAll(): Promise<AccountPayableFromDB[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('accounts_payable')
      .select('*, clients ( company_name )')
      .eq('saas_client_id', clientId)
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

    const { data, error } = await supabase.from('accounts_payable').insert(payload).select('*, clients ( company_name )').single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'accounts_payable'>): Promise<AccountPayableFromDB> {
    if (updates.status) {
      logStatusOperation('accounts_payable', 'update', id, updates.status, updates);
    }
    const { data, error } = await supabase.from('accounts_payable').update(updates).eq('id', id).select('*, clients ( company_name )').single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('accounts_payable').delete().eq('id', id);
    if (error) throw error;
  },

  async markAsPaid(id: string, paidDate: string, bankAccountId: string): Promise<void> {
    // Import validation functions
    const { validatePayablePayment } = await import('@/utils/statusValidation');
    
    // Validate input parameters
    if (!validatePayablePayment(id, paidDate, bankAccountId)) {
      throw new Error('Dados inválidos para registro de pagamento');
    }
    
    logStatusOperation('accounts_payable', 'markAsPaid', id, 'paid', { paidDate, bankAccountId });
    
    const { error } = await supabase.rpc('registrar_pagamento', {
      p_payable_id: id,
      p_paid_date: paidDate
    });
    
    if (error) {
      console.error("Erro ao registrar pagamento via RPC:", error);
      throw new Error(`Erro ao registrar pagamento: ${error.message}`);
    }
  },
};