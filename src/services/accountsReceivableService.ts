
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getCurrentClientId } from '@/utils/getCurrentClientId';
import { validateReceivablePayment } from '@/utils/statusValidation';

export type AccountReceivableFromDB = Tables<'accounts_receivable'> & {
  financial_clients?: { name: string } | null;
};

export const accountsReceivableService = {
  async getAll(): Promise<AccountReceivableFromDB[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('accounts_receivable')
      .select('*, financial_clients ( name )')
      .eq('saas_client_id', clientId)
      .order('due_date');

    if (error) throw new Error(`Erro ao buscar contas a receber: ${error.message}`);
    return data || [];
  },

  async create(account: Omit<TablesInsert<'accounts_receivable'>, 'id' | 'created_at' | 'updated_at' | 'saas_client_id' | 'status'>): Promise<AccountReceivableFromDB> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");
    
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Mapeamento de cliente não encontrado.');

    console.log('Creating receivable with data:', account);

    const payload: TablesInsert<'accounts_receivable'> = { ...account, saas_client_id: clientId, status: 'pending' };

    const { data, error } = await supabase.from('accounts_receivable').insert(payload).select('*, financial_clients ( name )').single();
    if (error) { 
      console.error("Supabase error details:", error); 
      throw new Error(`Erro ao criar conta a receber: ${error.message}`); 
    }
    console.log('Successfully created receivable:', data);
    return data;
  },

  async update(id: string, updates: TablesUpdate<'accounts_receivable'>): Promise<AccountReceivableFromDB> {
    console.log('Updating receivable with id:', id, 'data:', updates);
    const { data, error } = await supabase.from('accounts_receivable').update(updates).eq('id', id).select('*, financial_clients ( name )').single();
    if (error) {
      console.error('Error updating receivable:', error);
      throw error;
    }
    console.log('Successfully updated receivable:', data);
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('accounts_receivable').delete().eq('id', id);
    if (error) throw error;
  },

  async markAsReceived(id: string, receivedDate: string, bankAccountId: string): Promise<void> {
    console.log('Marking receivable as received:', { id, receivedDate, bankAccountId });
    
    // Validate input parameters
    if (!validateReceivablePayment(id, receivedDate, bankAccountId)) {
      throw new Error('Dados inválidos para registro de recebimento');
    }
    
    const response = await fetch(`/receivables/${id}/receive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ receivedDate, bankAccountId }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error('Erro ao registrar recebimento:', data);
      throw new Error(data.message || 'Erro ao registrar recebimento');
    }

    console.log('Successfully marked receivable as received');
  },
};
