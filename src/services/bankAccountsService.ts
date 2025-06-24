
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type BankAccount = Tables<'bank_accounts'> & {
  type: "corrente" | "poupanca" | "investimento" | null;
};

// Helper function to safely cast the type field
const validateAccountType = (type: string | null): "corrente" | "poupanca" | "investimento" | null => {
  if (type === "corrente" || type === "poupanca" || type === "investimento") {
    return type;
  }
  return null;
};

// Helper function to transform database response to our BankAccount type
const transformBankAccount = (dbAccount: Tables<'bank_accounts'>): BankAccount => ({
  ...dbAccount,
  type: validateAccountType(dbAccount.type)
});

export const bankAccountsService = {
  async getAll(): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return (data || []).map(transformBankAccount);
  },

  async create(account: Omit<TablesInsert<'bank_accounts'>, 'id' | 'created_at' | 'updated_at' | 'saas_client_id'>): Promise<BankAccount> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    const { data: clientMapping } = await supabase
      .from('saas_user_client_mapping')
      .select('client_id')
      .eq('user_id', user.id)
      .single();
    
    if (!clientMapping) throw new Error('Cliente não encontrado');

    // Set initial balance if provided, otherwise use 0
    const accountData = {
      ...account,
      balance: account.balance || 0,
      initial_balance: account.balance || 0,
      saas_client_id: clientMapping.client_id
    };

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(accountData)
      .select()
      .single();
    
    if (error) throw error;
    return transformBankAccount(data);
  },

  async update(id: string, updates: TablesUpdate<'bank_accounts'>): Promise<BankAccount> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformBankAccount(data);
  },

  async getBalance(id: string): Promise<number> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('balance')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data.balance || 0;
  }
};
