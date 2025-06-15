
export interface RegraComissao {
  id: string;
  nome: string;
  descricao: string;
  percentual: number; // ex: 5 para 5%
  editando?: boolean;
}

export interface CategoriaDespesa {
  id: string;
  nome: string;
  descricao: string;
  editando?: boolean;
}
