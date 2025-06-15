
export interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  status: 'pendente' | 'recebido' | 'atrasado' | 'parcial';
  cliente: string;
  categoria: string;
  numeroFatura?: string;
  dataRecebimento?: Date;
  formaRecebimento?: string;
  observacoes?: string;
}
