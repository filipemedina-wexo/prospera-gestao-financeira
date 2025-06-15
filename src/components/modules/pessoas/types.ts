export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  dataAdmissao: Date;
  salario: number;
  status: 'ativo' | 'inativo' | 'ferias';
}

export interface Departamento {
  id: string;
  nome: string;
  responsavelId: string; // ID do funcionário responsável
}

export interface Cargo {
    id: string;
    nome: string;
    descricao: string;
}

export interface Holerite {
  id: string;
  funcionarioId: string;
  competencia: string; // "MM/YYYY"
  salarioBase: number;
  totalProventos: number;
  totalDescontos: number;
  liquidoAPagar: number;
  proventos: { descricao: string; valor: number }[];
  descontos: { descricao: string; valor: number }[];
  status: 'pendente' | 'calculado' | 'pago';
}
