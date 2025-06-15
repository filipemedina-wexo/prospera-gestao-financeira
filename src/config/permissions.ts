
import { Role } from '@/data/users';

export type ExtendedRole = Role | 'super_admin';

export const permissionsByRole: Record<ExtendedRole, string[]> = {
  admin: ['*'],
  super_admin: ['*', 'saas.manage'],
  financeiro: [
    'dashboard.view',
    'caixa.view',
    'contas-pagar.view',
    'contas-receber.view',
    'dre.view',
    'relatorios.view',
    'fornecedores.view',
    'configuracoes.view',
  ],
  comercial: [
    'dashboard.view',
    'comercial.view',
    'crm.view',
    'configuracoes.view',
  ],
  contador: [
    'dashboard.view',
    'relatorios.view',
    'dre.view',
    'configuracoes.view',
  ],
};
