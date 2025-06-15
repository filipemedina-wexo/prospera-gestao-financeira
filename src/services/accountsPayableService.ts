
import { supabase } from '@/integrations/supabase/client';

export interface AccountPayable {
  id: string;
  saas_client_id: string;
  financial_client_id?: string;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  category?: string;
  created_at: string;
  updated_at: string;
}

export const accountsPayableService = {
  async getAll(saasClientId: string): Promise<AccountPayable[]> {
    const { data, error } = await supabase
      .from('accounts_payable')
      .select('*')
      .eq('saas_client_id', saasClientId)
      .order('due_date');

    if (error) {
      throw new Error(`Erro ao buscar contas a pagar: ${error.message}`);
    }

    return (data || []) as AccountPayable[];
  },

  async create(account: Omit<AccountPayable, 'id' | 'created_at' | 'updated_at'>): Promise<AccountPayable> {
    const { data, error } = await supabase
      .from('accounts_payable')
      .insert(account)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar conta a pagar: ${error.message}`);
    }

    return data as AccountPayable;
  },

  async update(id: string, updates: Partial<Omit<AccountPayable, 'id' | 'created_at' | 'updated_at'>>): Promise<AccountPayable> {
    const { data, error } = await supabase
      .from('accounts_payable')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar conta a pagar: ${error.message}`);
    }

    return data as AccountPayable;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts_payable')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar conta a pagar: ${error.message}`);
    }
  },

  async markAsPaid(id: string, paidDate: string): Promise<AccountPayable> {
    return this.update(id, {
      status: 'paid',
      paid_date: paidDate,
    });
  },
};
