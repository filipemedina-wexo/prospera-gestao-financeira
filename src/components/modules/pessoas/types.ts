
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
