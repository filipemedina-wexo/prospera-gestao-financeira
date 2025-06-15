
import { supabase } from '@/integrations/supabase/client';

export interface AccountReceivable {
  id: string;
  saas_client_id: string;
  financial_client_id?: string;
  description: string;
  amount: number;
  due_date: string;
  received_date?: string;
  status: 'pending' | 'received' | 'overdue' | 'partial';
  category?: string;
  created_at: string;
  updated_at: string;
}

export const accountsReceivableService = {
  async getAll(saasClientId: string): Promise<AccountReceivable[]> {
    const { data, error } = await supabase
      .from('accounts_receivable')
      .select('*')
      .eq('saas_client_id', saasClientId)
      .order('due_date');

    if (error) {
      throw new Error(`Erro ao buscar contas a receber: ${error.message}`);
    }

    return data || [];
  },

  async create(account: Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at'>): Promise<AccountReceivable> {
    const { data, error } = await supabase
      .from('accounts_receivable')
      .insert(account)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar conta a receber: ${error.message}`);
    }

    return data;
  },

  async update(id: string, updates: Partial<Omit<AccountReceivable, 'id' | 'created_at' | 'updated_at'>>): Promise<AccountReceivable> {
    const { data, error } = await supabase
      .from('accounts_receivable')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar conta a receber: ${error.message}`);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts_receivable')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar conta a receber: ${error.message}`);
    }
  },

  async markAsReceived(id: string, receivedDate: string): Promise<AccountReceivable> {
    return this.update(id, {
      status: 'received',
      received_date: receivedDate,
    });
  },
};
