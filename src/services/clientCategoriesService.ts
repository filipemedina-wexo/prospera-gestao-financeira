
import { supabase } from '@/integrations/supabase/client';

export interface ClientAccountCategory {
  id: string;
  saas_client_id: string;
  name: string;
  type: 'income' | 'expense';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Database response type where type is a string
interface DatabaseClientAccountCategory {
  id: string;
  saas_client_id: string;
  name: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Type guard to ensure the type is valid
const isValidCategoryType = (type: string): type is 'income' | 'expense' => {
  return type === 'income' || type === 'expense';
};

// Convert database response to typed interface
const convertToClientAccountCategory = (dbCategory: DatabaseClientAccountCategory): ClientAccountCategory => {
  if (!isValidCategoryType(dbCategory.type)) {
    throw new Error(`Invalid category type: ${dbCategory.type}`);
  }
  
  return {
    ...dbCategory,
    type: dbCategory.type
  };
};

export const clientCategoriesService = {
  async getAll(): Promise<ClientAccountCategory[]> {
    const { data, error } = await supabase
      .from('client_account_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Erro ao buscar categorias: ${error.message}`);
    }

    return (data || []).map(convertToClientAccountCategory);
  },

  async create(category: Omit<ClientAccountCategory, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>): Promise<ClientAccountCategory> {
    // Get current client ID
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
      .from('client_account_categories')
      .insert({
        ...category,
        saas_client_id: clientMapping.client_id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar categoria: ${error.message}`);
    }

    return convertToClientAccountCategory(data);
  },

  async update(id: string, updates: Partial<Omit<ClientAccountCategory, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>>): Promise<ClientAccountCategory> {
    const { data, error } = await supabase
      .from('client_account_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar categoria: ${error.message}`);
    }

    return convertToClientAccountCategory(data);
  },

  async delete(id: string): Promise<void> {
    // Soft delete
    const { error } = await supabase
      .from('client_account_categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar categoria: ${error.message}`);
    }
  },
};
