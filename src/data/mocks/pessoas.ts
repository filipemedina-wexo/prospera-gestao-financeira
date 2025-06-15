
import { Funcionario, Departamento, Cargo } from "@/components/modules/pessoas/types";

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
