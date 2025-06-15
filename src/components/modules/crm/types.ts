
export interface Client {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  nomeContato: string;
  email: string;
  telefone: string;
  whatsapp: string;
  status: "Ativo" | "Inativo";
  dataCadastro?: Date;
  origem?: string;
  observacoes?: string;
}
