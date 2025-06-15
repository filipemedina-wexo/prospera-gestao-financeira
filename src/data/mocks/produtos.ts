
import { ProdutoServico } from "@/components/modules/produtos-servicos/types";

export const initialProdutosServicos: ProdutoServico[] = [
  {
    id: "prod-1",
    nome: "Consultoria Financeira",
    tipo: "Serviço",
    categoria: "Consultoria",
    preco: 500,
    status: "Ativo",
    descricao: "Consultoria especializada em planejamento financeiro"
  },
  {
    id: "prod-2",
    nome: "Software de Gestão",
    tipo: "Produto",
    categoria: "Tecnologia",
    preco: 299,
    status: "Ativo",
    descricao: "Sistema completo de gestão empresarial"
  },
  {
    id: "prod-3",
    nome: "Treinamento Corporativo",
    tipo: "Serviço",
    categoria: "Educação",
    preco: 800,
    status: "Inativo",
    descricao: "Programa de capacitação para equipes"
  }
];
