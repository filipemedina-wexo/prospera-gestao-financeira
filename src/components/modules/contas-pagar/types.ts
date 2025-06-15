
export interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  status: 'pendente' | 'pago' | 'atrasado' | 'parcial';
  fornecedor: string;
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
