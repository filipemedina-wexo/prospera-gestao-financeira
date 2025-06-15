import { Proposta, Vendedor } from "@/components/modules/comercial/types";
import { ContaPagar } from "@/components/modules/contas-pagar/types";
import { ContaReceber } from "@/components/modules/contas-receber/types";
import { Client } from "@/components/modules/crm/types";
import { ProdutoServico } from "@/components/modules/produtos-servicos/types";

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

export const initialContasAReceber: ContaReceber[] = [
  {
    id: "1",
    descricao: "Cliente XYZ - Projeto Website",
    valor: 5800.00,
    dataVencimento: new Date(2024, 5, 18),
    status: "pendente",
    cliente: "XYZ Ltda",
    categoria: "Vendas de Serviços",
    numeroFatura: "FAT-001",
    competencia: "06/2024",
  },
  {
    id: "2", 
    descricao: "Venda de Produtos - Lote 123",
    valor: 3200.00,
    dataVencimento: new Date(2024, 5, 20),
    status: "recebido",
    cliente: "Cliente ABC",
    categoria: "Vendas de Produtos",
    numeroFatura: "NF-456",
    dataRecebimento: new Date(2024, 5, 19),
    formaRecebimento: "PIX",
    competencia: "06/2024",
  },
  {
    id: "3",
    descricao: "Mensalidade Software - Maio",
    valor: 299.90,
    dataVencimento: new Date(2024, 5, 10),
    status: "atrasado",
    cliente: "Empresa DEF",
    categoria: "Mensalidades",
    numeroFatura: "REC-789",
    competencia: "05/2024",
  },
  {
    id: "prop-2",
    descricao: "Recebimento da Proposta: Consultoria Marketing Digital",
    valor: 8500.00,
    dataVencimento: new Date(2024, 6, 12),
    status: "pendente",
    cliente: "StartupXYZ",
    categoria: "Venda de Projeto",
    competencia: "07/2024",
  }
];

export const initialContasAPagar: ContaPagar[] = [
  {
    id: "1",
    descricao: "Aluguel Escritório",
    valor: 4500.00,
    dataVencimento: new Date(2024, 5, 5),
    status: "pago",
    fornecedor: "Imobiliária Central",
    categoria: "Despesas Administrativas",
    competencia: "06/2024",
    dataPagamento: new Date(2024, 5, 4),
    formaPagamento: "Boleto"
  },
  {
    id: "2",
    descricao: "Software de Gestão",
    valor: 850.00,
    dataVencimento: new Date(2024, 5, 10),
    status: "pago",
    fornecedor: "Tech Solutions",
    categoria: "Despesas com Vendas",
    competencia: "06/2024",
  },
  {
    id: "3",
    descricao: "Fornecedor Matéria Prima",
    valor: 12800.00,
    dataVencimento: new Date(2024, 5, 15),
    status: "pendente",
    fornecedor: "Matérias ABC",
    categoria: "Custo de Mercadorias",
    competencia: "06/2024",
  },
  {
    id: "4",
    descricao: "Energia Elétrica",
    valor: 1250.40,
    dataVencimento: new Date(2024, 5, 20),
    status: "pendente",
    fornecedor: "Companhia de Energia",
    categoria: "Despesas Administrativas",
    competencia: "06/2024",
  },
  {
      id: "5",
      descricao: "Marketing Digital",
      valor: 3200.00,
      dataVencimento: new Date(2024, 4, 15),
      status: "pago",
      fornecedor: "Agência Digital XYZ",
      categoria: "Despesas com Vendas",
      competencia: "05/2024",
  },
];

export const initialClients: Client[] = [
  {
    id: "1",
    razaoSocial: "Empresa ABC Ltda",
    nomeFantasia: "Empresa ABC",
    cnpj: "11.111.111/0001-11",
    endereco: "Rua das Flores, 123",
    cidade: "São Paulo",
    estado: "SP",
    nomeContato: "Carlos Silva",
    email: "contato@empresaabc.com",
    telefone: "(11) 99999-1111",
    whatsapp: "(11) 99999-1111",
    status: "Ativo",
    dataCadastro: new Date(2023, 10, 15),
    origem: "Website",
    observacoes: "Cliente antigo, bom pagador.",
  },
  {
    id: "2",
    razaoSocial: "StartupXYZ",
    nomeFantasia: "StartupXYZ",
    cnpj: "22.222.222/0001-22",
    endereco: "Avenida Principal, 456",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    nomeContato: "Ana Pereira",
    email: "ana@startupxyz.com",
    telefone: "(21) 98888-2222",
    whatsapp: "(21) 98888-2222",
    status: "Ativo",
    dataCadastro: new Date(2024, 2, 20),
    origem: "Indicação",
    observacoes: "",
  },
  {
    id: "3",
    razaoSocial: "XYZ Ltda",
    nomeFantasia: "Loja XYZ",
    cnpj: "33.333.333/0001-33",
    endereco: "Rua dos Comerciantes, 789",
    cidade: "Belo Horizonte",
    estado: "MG",
    nomeContato: "Mariana Costa",
    email: "compras@lojaxyz.com.br",
    telefone: "(31) 97777-3333",
    whatsapp: "(31) 97777-3333",
    status: "Inativo",
    dataCadastro: new Date(2023, 5, 1),
    origem: "Feira de negócios",
    observacoes: "Inativo por falta de compras há mais de 6 meses.",
  }
];

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
