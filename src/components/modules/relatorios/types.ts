
export type ExtratoTransacao = {
  id: string;
  data: Date;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  categoria: string;
  saldoApos: number;
};
