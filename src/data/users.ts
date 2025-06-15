
export type Role = 'admin' | 'financeiro' | 'comercial' | 'contador';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Em uma aplicação real, isso seria um hash
  role: Role;
  permissions: string[];
}

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@prospera.com',
    password: 'password',
    role: 'admin',
    permissions: ['*'], // Admin tem todas as permissões
  },
  {
    id: '2',
    name: 'Finance User',
    email: 'financeiro@prospera.com',
    password: 'password',
    role: 'financeiro',
    permissions: [
      'dashboard.view',
      'caixa.view',
      'contas-pagar.view',
      'contas-receber.view',
      'dre.view',
      'relatorios.view',
    ],
  },
  {
    id: '3',
    name: 'Comercial User',
    email: 'comercial@prospera.com',
    password: 'password',
    role: 'comercial',
    permissions: [
        'dashboard.view',
        'comercial.view',
        'crm.view',
    ],
  },
  {
    id: '4',
    name: 'Contador User',
    email: 'contador@prospera.com',
    password: 'password',
    role: 'contador',
    permissions: [
        'relatorios.view',
        'dre.view'
    ],
  },
];
