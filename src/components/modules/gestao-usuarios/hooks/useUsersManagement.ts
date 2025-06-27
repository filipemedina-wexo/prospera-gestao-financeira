
import { useState, useEffect } from 'react';
import { User } from '@/data/users';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMultiTenant } from '@/contexts/MultiTenantContext';

interface AuthUser {
  id: string;
  email: string;
}

interface Assignment {
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export function useUsersManagement(isActive: boolean) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useAuth();
  const { toast } = useToast();

  // Check if user can manage users (super admin only for now)
  const canManageUsers = hasPermission('saas.manage');

  useEffect(() => {
    if (isActive && canManageUsers) {
      fetchUsers();
    }
  }, [isActive, canManageUsers]);

  const { currentClientId } = useMultiTenant();

  const fetchUsers = async () => {
    if (!canManageUsers) return;

    setLoading(true);
    try {
      const { data: assignments, error } = await supabase
        .from('saas_client_user_assignments')
        .select('*')
        .eq('is_active', true)
        .eq('client_id', currentClientId || '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: authData, error: authError } = await supabase.functions.invoke('list-auth-users', { body: {} });
      if (authError) throw authError;

      const authUsers = (authData as any)?.users as AuthUser[] || [];

      const usersList: User[] = await Promise.all(
        (assignments || []).map(async (assignment: Assignment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', assignment.user_id)
            .single();

          const authUser = authUsers.find((u: AuthUser) => u.id === assignment.user_id);

          return {
            id: assignment.user_id,
            name: profile?.full_name || 'Nome não disponível',
            email: authUser?.email || 'Email não disponível',
            role: assignment.role as User['role'],
            status: assignment.is_active ? 'active' : 'inactive',
            lastLogin: undefined,
            createdAt: assignment.created_at
          };
        })
      );

      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData: User, existingUser: User | null) => {
    if (!canManageUsers) return;

    try {
      if (existingUser) {
        const { error: assignError } = await supabase
          .from('saas_client_user_assignments')
          .update({
            role: userData.role,
            is_active: userData.status === 'active'
          })
          .eq('user_id', existingUser.id)
          .eq('client_id', currentClientId || '');

        if (assignError) throw assignError;

        await supabase
          .from('profiles')
          .update({ full_name: userData.name })
          .eq('id', existingUser.id);

        setUsers(users.map(user =>
          user.id === existingUser.id ? { ...userData, id: existingUser.id } : user
        ));

        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso.',
        });
      } else {
        const { error } = await supabase.rpc('create_client_admin_user', {
          client_id_param: currentClientId,
          admin_email: userData.email,
          admin_name: userData.name
        });

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Usuário criado com sucesso.',
        });

        await fetchUsers();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar usuário.',
        variant: 'destructive',
      });
    }
  };

  return {
    users,
    loading,
    canManageUsers,
    saveUser,
  };
}
