
import { permissionsByRole } from '@/config/permissions';
import { AppUser } from '@/types/auth';

export const checkUserPermission = (user: AppUser | null, permission: string): boolean => {
  if (!user || !user.role) {
    return false;
  }

  const userPermissions = permissionsByRole[user.role];
  if (!userPermissions) {
    return false;
  }
  
  if (userPermissions.includes('*')) {
    return true;
  }
  
  return userPermissions.includes(permission);
};
