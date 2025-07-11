import { supabase } from '@/integrations/supabase/client';
import { getCurrentClientId } from '@/utils/getCurrentClientId';

export interface Proposal {
  id: string;
  saas_client_id: string;
  title: string;
  description?: string;
  client_id?: string;
  seller_id?: string;
  total_value: number;
  status: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  accepted_at?: string;
  rejected_at?: string;
  notes?: string;
  metadata?: any;
  client?: {
    id: string;
    company_name: string;
  };
  seller?: {
    id: string;
    name: string;
  };
  items?: ProposalItem[];
}

export interface ProposalItem {
  id: string;
  proposal_id: string;
  product_service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface ProposalCreate {
  title: string;
  description?: string;
  client_id?: string;
  seller_id?: string;
  expires_at?: string;
  notes?: string;
  items: ProposalItemCreate[];
}

export interface ProposalItemCreate {
  product_service_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export const proposalsService = {
  async getAll(): Promise<Proposal[]> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        client:clients(id, company_name),
        seller:sellers(id, name)
      `)
      .eq('saas_client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar propostas: ${error.message}`);
    }

    return data || [];
  },

  async getById(id: string): Promise<Proposal | null> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    const { data, error } = await supabase
      .from('proposals')
      .select(`
        *,
        client:clients(id, company_name),
        seller:sellers(id, name),
        items:proposal_items(*)
      `)
      .eq('id', id)
      .eq('saas_client_id', clientId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar proposta: ${error.message}`);
    }

    return data;
  },

  async create(proposal: ProposalCreate): Promise<Proposal> {
    const clientId = await getCurrentClientId();
    if (!clientId) throw new Error('Cliente SaaS não encontrado.');

    // Calculate total value from items
    const totalValue = proposal.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);

    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        saas_client_id: clientId,
        title: proposal.title,
        description: proposal.description,
        client_id: proposal.client_id,
        seller_id: proposal.seller_id,
        total_value: totalValue,
        expires_at: proposal.expires_at,
        notes: proposal.notes
      })
      .select()
      .single();

    if (proposalError) {
      throw new Error(`Erro ao criar proposta: ${proposalError.message}`);
    }

    // Create proposal items
    if (proposal.items.length > 0) {
      const items = proposal.items.map(item => ({
        proposal_id: proposalData.id,
        product_service_id: item.product_service_id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('proposal_items')
        .insert(items);

      if (itemsError) {
        throw new Error(`Erro ao criar itens da proposta: ${itemsError.message}`);
      }
    }

    return this.getById(proposalData.id) as Promise<Proposal>;
  },

  async update(id: string, updates: Partial<Proposal>): Promise<Proposal> {
    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar proposta: ${error.message}`);
    }

    return data;
  },

  async updateStatus(id: string, status: string, notes?: string): Promise<Proposal> {
    const updates: any = { status };
    if (notes) updates.notes = notes;

    return this.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar proposta: ${error.message}`);
    }
  }
};