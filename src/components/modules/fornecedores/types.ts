
export interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email: string;
  telefone: string;
  status: 'Ativo' | 'Inativo';
  tipo: string;
  chavePix?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  nomeContato?: string;
  observacoes?: string;
  dataCadastro: Date;
  condicaoPagamento?: string;
  proximoPagamento?: Date;
  valorProximoPagamento?: number;
}

export interface TipoFornecedor {
  id: string;
  nome: string;
}
