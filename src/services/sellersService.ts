import { supabase } from '@/integrations/supabase/client';
import { getCurrentClientId } from '@/utils/getCurrentClientId';

export interface Seller {
  id: string;
  saas_client_id: string;
  name: string;
  email?: string;
  phone?: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerCreate {
  name: string;
  email?: string;
  phone?: string;
  commission_rate?: number;
}

export const sellersService = {
  async getAll(): Promise<Seller[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('saas_client_id', clientId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Erro ao buscar vendedores: ${error.message}`);
    }

    return data || [];
  },

  async create(seller: SellerCreate): Promise<Seller> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('sellers')
      .insert({
        saas_client_id: clientId,
        ...seller
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar vendedor: ${error.message}`);
    }

    return data;
  },

  async update(id: string, updates: Partial<SellerCreate>): Promise<Seller> {
    const { data, error } = await supabase
      .from('sellers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar vendedor: ${error.message}`);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sellers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar vendedor: ${error.message}`);
    }
  }
};