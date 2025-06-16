
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

// For now, return mock data since the table doesn't exist yet
export const clientCategoriesService = {
  async getAll(): Promise<ClientAccountCategory[]> {
    // Mock data until the client_account_categories table is created
    return [
      {
        id: '1',
        saas_client_id: 'mock',
        name: 'Despesas Fixas',
        type: 'expense',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        saas_client_id: 'mock',
        name: 'Custos de Mercadoria',
        type: 'expense',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        saas_client_id: 'mock',
        name: 'Receita de Vendas',
        type: 'income',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  },

  async create(category: Omit<ClientAccountCategory, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>): Promise<ClientAccountCategory> {
    // Mock implementation until table is created
    throw new Error('Categories creation will be implemented after database table creation');
  },

  async update(id: string, updates: Partial<Omit<ClientAccountCategory, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>>): Promise<ClientAccountCategory> {
    // Mock implementation until table is created
    throw new Error('Categories update will be implemented after database table creation');
  },

  async delete(id: string): Promise<void> {
    // Mock implementation until table is created
    throw new Error('Categories deletion will be implemented after database table creation');
  },
};
