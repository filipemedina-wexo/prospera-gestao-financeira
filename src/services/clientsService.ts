
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

  async getAllSuppliers(): Promise<Client[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('saas_client_id', clientId)
      .in('client_type', ['supplier', 'both'])
      .order('company_name');

    if (error) throw new Error(`Erro ao buscar fornecedores: ${error.message}`);
    return data || [];
  },

  async getAllCustomers(): Promise<Client[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('saas_client_id', clientId)
      .in('client_type', ['customer', 'both'])
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

  async create(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('clients')
      .insert({
        ...clientData,
        saas_client_id: clientId,
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);
    return data;
  },

  async update(id: string, clientData: Partial<Client>): Promise<Client> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .eq('saas_client_id', clientId)
      .select()
      .single();

    if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
    return data;
  },

  async delete(id: string): Promise<void> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('saas_client_id', clientId);

    if (error) throw new Error(`Erro ao deletar cliente: ${error.message}`);
  },

  // Método para migrar dados do financial_clients para clients
  async migrateFromFinancialClients(): Promise<void> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    // Buscar dados do financial_clients
    const { data: financialClients, error: fetchError } = await supabase
      .from('financial_clients')
      .select('*')
      .eq('saas_client_id', clientId);

    if (fetchError) {
      console.error('Erro ao buscar financial_clients:', fetchError);
      return;
    }

    if (!financialClients || financialClients.length === 0) {
      return; // Nada para migrar
    }

    // Verificar quais já existem na tabela clients
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id')
      .eq('saas_client_id', clientId);

    const existingIds = new Set(existingClients?.map(c => c.id) || []);

    // Migrar apenas os que não existem
    const toMigrate = financialClients.filter(fc => !existingIds.has(fc.id));

    if (toMigrate.length === 0) {
      return; // Todos já migrados
    }

    const clientsToInsert = toMigrate.map(fc => ({
      id: fc.id,
      saas_client_id: fc.saas_client_id,
      company_name: fc.name,
      contact_email: fc.email,
      contact_phone: fc.phone,
      document_number: fc.document,
      address: fc.address,
      city: fc.city,
      state: fc.state,
      zip_code: fc.cep,
      client_type: 'both' as const, // Assumindo que são tanto clientes quanto fornecedores
      created_at: fc.created_at,
      updated_at: fc.updated_at,
    }));

    const { error: insertError } = await supabase
      .from('clients')
      .insert(clientsToInsert);

    if (insertError) {
      console.error('Erro ao migrar dados:', insertError);
      throw new Error(`Erro ao migrar dados: ${insertError.message}`);
    }

    console.log(`Migrados ${clientsToInsert.length} registros para a tabela clients`);
  }
};
