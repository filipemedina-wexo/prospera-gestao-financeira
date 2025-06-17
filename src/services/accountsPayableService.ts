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
  financial_clients?: { name: string }; // Adicionado para receber o nome do fornecedor
}

type CreateAccountPayload = Omit<AccountPayable, 'id' | 'created_at' | 'updated_at' | 'saas_client_id' | 'financial_clients'>;
type UpdateAccountPayload = Partial<CreateAccountPayload>;

export const accountsPayableService = {
  async getAll(): Promise<AccountPayable[]> {
    // A query agora busca o nome do financial_client relacionado
    const { data, error } = await supabase
      .from('accounts_payable')
      .select('*, financial_clients ( name )')
      .order('due_date');

    if (error) {
      throw new Error(`Erro ao buscar contas a pagar: ${error.message}`);
    }

    return (data || []) as AccountPayable[];
  },

  async create(account: CreateAccountPayload): Promise<AccountPayable> {
    const { data: clientMapping } = await supabase
      .from('saas_user_client_mapping')
      .select('client_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('is_active', true)
      .single();

    if (!clientMapping) {
      throw new Error('Cliente não encontrado');
    }

    const { data, error } = await supabase
      .from('accounts_payable')
      .insert({
        ...account,
        saas_client_id: clientMapping.client_id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar conta a pagar: ${error.message}`);
    }

    return data as AccountPayable;
  },

  async update(id: string, updates: UpdateAccountPayload): Promise<AccountPayable> {
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