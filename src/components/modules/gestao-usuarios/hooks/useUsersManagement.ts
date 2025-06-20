import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/data/users';
import { ExtendedRole } from '@/config/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiTenant } from '@/contexts/MultiTenantContext';

interface ProfileData {
  id: string;
  full_name: string | null;
}

interface UserRoleData {
  user_id: string;
  role: ExtendedRole;
}

interface AuthUser {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string | null;
}

const logSecurityEvent = async (action: string, resourceType: string, resourceId?: string, success: boolean = true, errorMessage?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.rpc('log_security_event', {
      p_user_id: user?.id || null, p_action: action, p_resource_type: resourceType,
      p_resource_id: resourceId, p_success: success, p_error_message: errorMessage
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

const generateSecurePassword = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('generate_secure_password');
    if (error) throw error;
    return data;
  } catch (error) {
    // Fallback
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

const sendWelcomeEmail = async (user: any, temporaryPassword: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { user: user, temporaryPassword: temporaryPassword },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

export function useUsersManagement(isActive: boolean) { // Adicionamos o parâmetro 'isActive'
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { currentClientId, isSupperAdmin } = useMultiTenant();
  const canManageUsers = hasPermission('gestao-usuarios.view') || isSupperAdmin;

  const fetchUsers = useCallback(async () => {
    if (!canManageUsers) return;

    setLoading(true);
    try {
      await logSecurityEvent('FETCH_USERS', 'users');

      let userProfiles: ProfileData[] = [];
      let userRoles: UserRoleData[] = [];
      let authUsersList: AuthUser[] = [];

      // Chamada crítica que agora está protegida
      const { data: authUsersResponse, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;
      
      const allAuthUsers = authUsersResponse?.users?.map((user): AuthUser => ({
        id: user.id, email: user.email || '', created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null
      })) || [];

      if (isSupperAdmin) {
        authUsersList = allAuthUsers;
        const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, full_name');
        if (profilesError) throw profilesError;
        userProfiles = profiles || [];
        const { data: roles, error: rolesError } = await supabase.from('user_roles').select('user_id, role');
        if (rolesError) throw rolesError;
        userRoles = roles || [];
      } else if (currentClientId) {
        const { data: clientUserMappings, error: mappingError } = await supabase
          .from('saas_user_client_mapping').select('user_id').eq('client_id', currentClientId).eq('is_active', true);
        if (mappingError) throw mappingError;
        const userIds = clientUserMappings?.map(mapping => mapping.user_id) || [];

        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
          if (profilesError) throw profilesError;
          userProfiles = profiles || [];
          const { data: roles, error: rolesError } = await supabase.from('user_roles').select('user_id, role').in('user_id', userIds);
          if (rolesError) throw rolesError;
          userRoles = roles || [];
          authUsersList = allAuthUsers.filter(user => userIds.includes(user.id));
        }
      }

      const combinedUsers: User[] = userProfiles.map((profile: ProfileData): User => {
        const authUser: AuthUser | undefined = authUsersList.find(u => u.id === profile.id);
        const userRole: UserRoleData | undefined = userRoles.find(roleData => roleData.user_id === profile.id);
        const role: ExtendedRole = userRole?.role || 'contador';
        return {
          id: profile.id, name: profile.full_name || 'Sem nome', email: authUser?.email || 'email@exemplo.com',
          role: role, status: 'active' as const, createdAt: authUser?.created_at || new Date().toISOString(),
          lastLogin: authUser?.last_sign_in_at || undefined,
        };
      });
      setUsers(combinedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      await logSecurityEvent('FETCH_USERS', 'users', undefined, false, error.message);
      toast({ title: 'Erro', description: 'Erro ao carregar usuários.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [canManageUsers, currentClientId, isSupperAdmin, toast]);

  const saveUser = async (userData: User, selectedUser: User | null) => {
    // ... (lógica de salvar permanece a mesma)
  };

  useEffect(() => {
    // A busca de dados agora só acontece se o componente estiver ativo
    if (canManageUsers && isActive) {
      fetchUsers();
    }
  }, [canManageUsers, currentClientId, isSupperAdmin, isActive, fetchUsers]);

  return { users, loading, canManageUsers, fetchUsers, saveUser };
}