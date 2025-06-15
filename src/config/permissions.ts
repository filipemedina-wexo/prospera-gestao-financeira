
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

// Função utilitária para verificar se um usuário tem uma permissão específica
export const checkPermission = (userRole: ExtendedRole | null, permission: string): boolean => {
  if (!userRole) return false;
  
  const permissions = permissionsByRole[userRole];
  if (!permissions) return false;
  
  return permissions.includes('*') || permissions.includes(permission);
};

// Função para obter todas as permissões de um role
export const getPermissionsForRole = (role: ExtendedRole): string[] => {
  return permissionsByRole[role] || [];
};
