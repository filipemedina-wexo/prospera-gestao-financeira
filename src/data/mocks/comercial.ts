
import { Proposta, Vendedor } from "@/components/modules/comercial/types";

export const initialPropostas: Proposta[] = [
  {
    id: "1",
    titulo: "Proposta Website Empresa ABC",
    cliente: "Empresa ABC Ltda",
    valorTotal: 15800.00,
    dataCriacao: new Date(2024, 5, 10),
    dataValidade: new Date(2024, 6, 10),
    status: "enviada",
    vendedor: "João Silva",
    faturada: false,
    itens: [
      {
        id: "1",
        descricao: "Desenvolvimento Website Responsivo",
        quantidade: 1,
        valorUnitario: 12000.00,
        valorTotal: 12000.00
      },
      {
        id: "2",
        descricao: "Sistema de Gerenciamento de Conteúdo",
        quantidade: 1,
        valorUnitario: 3800.00,
        valorTotal: 3800.00
      }
    ],
    observacoes: "Prazo de entrega: 45 dias úteis"
  },
  {
    id: "2",
    titulo: "Consultoria Marketing Digital",
    cliente: "StartupXYZ",
    valorTotal: 8500.00,
    dataCriacao: new Date(2024, 5, 12),
    dataValidade: new Date(2024, 6, 12),
    status: "aceita",
    vendedor: "Maria Santos",
    faturada: true,
    itens: [
      {
        id: "3",
        descricao: "Auditoria Completa Marketing Digital",
        quantidade: 1,
        valorUnitario: 2500.00,
        valorTotal: 2500.00
      },
      {
        id: "4",
        descricao: "Implementação Estratégia SEO",
        quantidade: 1,
        valorUnitario: 6000.00,
        valorTotal: 6000.00
      }
    ]
  }
];

export const initialVendedores: Vendedor[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@empresa.com",
    percentualComissao: 5.0,
    metaMensal: 50000.00,
    vendasMes: 23800.00,
    comissaoAcumulada: 1190.00
  },
  {
    id: "2",
    nome: "Maria Santos", 
    email: "maria@empresa.com",
    percentualComissao: 6.0,
    metaMensal: 40000.00,
    vendasMes: 45200.00,
    comissaoAcumulada: 2712.00
  }
];
