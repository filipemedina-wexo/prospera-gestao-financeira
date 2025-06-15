
export interface ItemProposta {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface Proposta {
  id: string;
  titulo: string;
  cliente: string;
  valorTotal: number;
  dataCriacao: Date;
  dataValidade: Date;
  status: 'rascunho' | 'enviada' | 'aceita' | 'recusada' | 'perdida' | 'negociacao';
  vendedor: string;
  itens: ItemProposta[];
  observacoes?: string;
  faturada?: boolean;
}

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  percentualComissao: number;
  metaMensal: number;
  vendasMes: number;
  comissaoAcumulada: number;
}
