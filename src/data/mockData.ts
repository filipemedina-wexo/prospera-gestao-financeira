import { Proposta, Vendedor } from "@/components/modules/comercial/types";
import { ContaPagar } from "@/components/modules/contas-pagar/types";
import { ContaReceber } from "@/components/modules/contas-receber/types";
import { Client, Compra } from "@/components/modules/crm/types";
import { ProdutoServico } from "@/components/modules/produtos-servicos/types";
import { Funcionario, Departamento, Cargo } from "@/components/modules/pessoas/types";

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
    dataAniversario: new Date(1980, 4, 20),
    historicoCompras: [
      { id: 'c1', data: new Date(2024, 4, 1), valor: 1200, produtos: ['Consultoria'] },
      { id: 'c2', data: new Date(2024, 5, 5), valor: 3800, produtos: ['Desenvolvimento Website'] },
    ],
    valorTotalCompras: 5000,
    dataUltimaCompra: new Date(2024, 5, 5),
    frequenciaCompra: "Regular",
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
    dataAniversario: new Date(1992, 8, 10),
    historicoCompras: [
      { id: 'c3', data: new Date(2024, 2, 25), valor: 8500, produtos: ['Auditoria Completa Marketing Digital', 'Implementação Estratégia SEO'] },
    ],
    valorTotalCompras: 8500,
    dataUltimaCompra: new Date(2024, 2, 25),
    frequenciaCompra: "Ocasional",
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
    dataAniversario: new Date(1985, 11, 2),
    historicoCompras: [],
    valorTotalCompras: 0,
    dataUltimaCompra: undefined,
    frequenciaCompra: "Raro",
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

export const initialDepartamentos: Departamento[] = [
  { id: 'dep-1', nome: 'Tecnologia', responsavelId: 'func-1' },
  { id: 'dep-2', nome: 'Comercial', responsavelId: 'func-2' },
  { id: 'dep-3', nome: 'Administrativo', responsavelId: 'func-4' },
];

export const initialCargos: Cargo[] = [
    { id: 'cargo-1', nome: 'Desenvolvedor Full-Stack', descricao: 'Responsável pelo desenvolvimento de aplicações web, do back-end ao front-end.' },
    { id: 'cargo-2', nome: 'Gerente de Vendas', descricao: 'Lidera a equipe de vendas, define metas e estratégias comerciais.' },
    { id: 'cargo-3', nome: 'Analista de Marketing', descricao: 'Cria e executa campanhas de marketing digital e offline.' },
    { id: 'cargo-4', nome: 'Gerente Financeiro', descricao: 'Supervisiona todas as atividades financeiras da empresa.' },
    { id: 'cargo-5', nome: 'Designer UX/UI', descricao: 'Projeta a experiência e a interface de usuário para produtos digitais.' },
];

export const initialFuncionarios: Funcionario[] = [
  {
    id: 'func-1',
    nome: 'Ana Oliveira',
    email: 'ana.oliveira@empresa.com',
    cargo: 'Desenvolvedora Full-Stack',
    departamento: 'Tecnologia',
    dataAdmissao: new Date(2022, 1, 15),
    salario: 8500,
    status: 'ativo',
  },
  {
    id: 'func-2',
    nome: 'João Silva',
    email: 'joao.silva@empresa.com',
    cargo: 'Gerente de Vendas',
    departamento: 'Comercial',
    dataAdmissao: new Date(2020, 5, 10),
    salario: 12000,
    status: 'ativo',
  },
  {
    id: 'func-3',
    nome: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    cargo: 'Analista de Marketing',
    departamento: 'Comercial',
    dataAdmissao: new Date(2023, 8, 1),
    salario: 6000,
    status: 'ferias',
  },
  {
    id: 'func-4',
    nome: 'Carlos Pereira',
    email: 'carlos.pereira@empresa.com',
    cargo: 'Gerente Financeiro',
    departamento: 'Administrativo',
    dataAdmissao: new Date(2019, 3, 22),
    salario: 13500,
    status: 'ativo',
  },
    {
    id: 'func-5',
    nome: 'Sofia Costa',
    email: 'sofia.costa@empresa.com',
    cargo: 'Designer UX/UI',
    departamento: 'Tecnologia',
    dataAdmissao: new Date(2023, 11, 5),
    salario: 7200,
    status: 'inativo',
  },
];
