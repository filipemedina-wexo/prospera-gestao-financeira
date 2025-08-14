export interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  fornecedor: string;
  fornecedorId?: string; // ID do financial_client
  categoria: string;
  numeroDocumento?: string;
  dataPagamento?: Date;
  formaPagamento?: string;
  competencia?: string; // "MM/YYYY"
  recorrente?: boolean;
  frequencia?: 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual';
  numParcelas?: number;
  parcelaAtual?: number;
  idGrupoRecorrencia?: string;
}

// Status mapping for accounts_payable
export const ACCOUNTS_PAYABLE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELED: 'canceled'
} as const;

export type AccountPayableStatus = typeof ACCOUNTS_PAYABLE_STATUS[keyof typeof ACCOUNTS_PAYABLE_STATUS];