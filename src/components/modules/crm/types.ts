// Updated interface that maintains compatibility with existing CRM components
export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  cep?: string | null;
  saas_client_id: string;
  created_at: string;
  updated_at: string;
  
  // Legacy fields for compatibility with existing UI components
  razaoSocial?: string;
  nomeFantasia?: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  nomeContato?: string;
  telefone?: string;
  whatsapp?: string;
  status?: "Ativo" | "Inativo";
  dataCadastro?: Date;
  origem?: string;
  observacoes?: string;
  dataAniversario?: Date;
  historicoCompras?: Compra[];
  valorTotalCompras?: number;
  dataUltimaCompra?: Date;
  frequenciaCompra?: "Regular" | "Ocasional" | "Raro";
  
  // Additional computed fields
  company?: string;
  lastContact?: Date;
  value?: number;
  tags?: string[];
  notes?: string;
  source?: string;
  assignedTo?: string;
  createdAt?: Date;
  segment?: 'premium' | 'standard' | 'basic';
  industry?: string;
  size?: 'pequena' | 'média' | 'grande';
  location?: string;
  website?: string;
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface Compra {
  id: string;
  data: Date;
  valor: number;
  produtos: string[];
}