
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type FinancialTransaction = Tables<'financial_transactions'>;

export const financialTransactionsService = {
  async getAll(): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getByBankAccount(bankAccountId: string): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('bank_account_id', bankAccountId)
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(transaction: Omit<TablesInsert<'financial_transactions'>, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>): Promise<FinancialTransaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    const { data: clientMapping } = await supabase
      .from('saas_user_client_mapping')
      .select('client_id')
      .eq('user_id', user.id)
      .single();
    
    if (!clientMapping) throw new Error('Cliente não encontrado');

    const { data, error } = await supabase
      .from('financial_transactions')
      .insert({ ...transaction, saas_client_id: clientMapping.client_id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: TablesUpdate<'financial_transactions'>): Promise<FinancialTransaction> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
