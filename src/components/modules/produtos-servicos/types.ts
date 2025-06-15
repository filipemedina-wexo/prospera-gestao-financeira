
export interface ProdutoServico {
  id: string;
  nome: string;
  tipo: "Serviço" | "Produto";
  categoria: string;
  preco: number;
  status: "Ativo" | "Inativo";
  descricao: string;
}
