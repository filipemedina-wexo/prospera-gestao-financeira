export interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: Date;
  status: 'pendente' | 'recebido' | 'atrasado' | 'parcial';
  cliente: string;
  cliente_id?: string;
  categoria: string;
  categoria_id?: string;
  numeroFatura?: string;
  dataRecebimento?: Date;
  formaRecebimento?: string;
  observacoes?: string;
  competencia?: string;
}