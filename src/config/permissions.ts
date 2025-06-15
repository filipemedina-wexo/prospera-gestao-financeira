
import { Role } from '@/data/users';

export const permissionsByRole: Record<Role, string[]> = {
  admin: ['*'],
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
