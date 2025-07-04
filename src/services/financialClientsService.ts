import { supabase } from '@/integrations/supabase/client';
import { TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { getCurrentClientId } from '@/utils/getCurrentClientId';

export interface FinancialClient {
  id: string;
  saas_client_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  cep?: string | null;
  created_at: string;
  updated_at: string;
}

type FinancialClientInsert = TablesInsert<'financial_clients'>;
type FinancialClientUpdate = TablesUpdate<'financial_clients'>;

export const financialClientsService = {
  async getAll(): Promise<FinancialClient[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('financial_clients')
      .select('*')
      .eq('saas_client_id', clientId)
      .order('name');

    if (error) {
      throw new Error(`Erro ao buscar clientes financeiros: ${error.message}`);
    }

    return data || [];
  },

  async create(client: Omit<FinancialClientInsert, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>): Promise<FinancialClient> {
    const clientId = await getCurrentClientId();
    if (!clientId) {
      throw new Error('Cliente SaaS não encontrado para o usuário atual');
    }

    const payload: FinancialClientInsert = {
        ...client,
        saas_client_id: clientId,
    };

    const { data, error } = await supabase
      .from('financial_clients')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("Erro detalhado do Supabase:", error);
      throw new Error(`Erro ao criar cliente financeiro: ${error.message}`);
    }

    return data;
  },

  async update(id: string, updates: FinancialClientUpdate): Promise<FinancialClient> {
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