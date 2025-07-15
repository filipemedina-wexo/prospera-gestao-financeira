import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { getCurrentClientId } from '@/utils/getCurrentClientId';

export type Client = Tables<'clients'>;

export const clientsService = {
  async getAll(): Promise<Client[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('saas_client_id', clientId)
      .order('company_name');

    if (error) throw new Error(`Erro ao buscar clientes: ${error.message}`);
    return data || [];
  },

  async getById(id: string): Promise<Client | null> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('saas_client_id', clientId)
      .single();

    if (error) return null;
    return data;
  },
};