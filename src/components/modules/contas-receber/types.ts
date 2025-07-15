export interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  status: 'pendente' | 'recebido' | 'atrasado' | 'parcial';
  cliente: string;
  clienteId?: string;
  categoria: string;
  numeroFatura?: string;
  dataRecebimento?: Date;
  formaRecebimento?: string;
  observacoes?: string;
  competencia?: string;
}

// Status mapping for accounts_receivable
export const ACCOUNTS_RECEIVABLE_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
  PAID: 'paid'
} as const;

export type AccountReceivableStatus = typeof ACCOUNTS_RECEIVABLE_STATUS[keyof typeof ACCOUNTS_RECEIVABLE_STATUS];