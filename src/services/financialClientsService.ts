
import { supabase } from '@/integrations/supabase/client';

export interface FinancialClient {
  id: string;
  saas_client_id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  created_at: string;
  updated_at: string;
}

export const financialClientsService = {
  async getAll(saasClientId: string): Promise<FinancialClient[]> {
    const { data, error } = await supabase
      .from('financial_clients')
      .select('*')
      .eq('saas_client_id', saasClientId)
      .order('name');

    if (error) {
      throw new Error(`Erro ao buscar clientes financeiros: ${error.message}`);
    }

    return data || [];
  },

  async create(client: Omit<FinancialClient, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialClient> {
    const { data, error } = await supabase
      .from('financial_clients')
      .insert(client)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar cliente financeiro: ${error.message}`);
    }

    return data;
  },

  async update(id: string, updates: Partial<Omit<FinancialClient, 'id' | 'created_at' | 'updated_at'>>): Promise<FinancialClient> {
    const { data, error } = await supabase
      .from('financial_clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar cliente financeiro: ${error.message}`);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_clients')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar cliente financeiro: ${error.message}`);
    }
  },
};
