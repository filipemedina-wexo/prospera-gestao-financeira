
import { useState, useEffect } from 'react';
import { User } from '@/data/users';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock users data for now - in production this would come from the database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T10:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    role: 'financeiro',
    status: 'active',
    createdAt: '2024-01-02T11:00:00Z',
    lastLogin: '2024-01-14T16:45:00Z',
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@empresa.com',
    role: 'comercial',
    status: 'inactive',
    createdAt: '2024-01-03T12:00:00Z',
    lastLogin: '2024-01-10T09:15:00Z',
  },
];

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

  const fetchUsers = async () => {
    if (!canManageUsers) return;

    setLoading(true);
    try {
      // For now, use mock data
      // In production, this would fetch from saas_client_user_assignments table
      // with the proper RLS policies we just created
      setUsers(mockUsers);

      // TODO: Replace with real database query once we have proper user management tables
      /*
      const { data, error } = await supabase
        .from('saas_client_user_assignments')
        .select(`
          *,
          profiles(full_name),
          user_roles(role)
        `)
        .eq('is_active', true);

      if (error) throw error;
      
      // Transform data to User format
      const transformedUsers = data?.map(assignment => ({
        id: assignment.user_id,
        name: assignment.profiles?.full_name || 'Unknown',
        email: 'user@example.com', // Would need to get from auth.users
        role: assignment.role,
        status: assignment.is_active ? 'active' : 'inactive',
        lastLogin: undefined,
        createdAt: assignment.created_at
      })) || [];
      
      setUsers(transformedUsers);
      */
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
        // Update existing user
        const updatedUsers = users.map(user =>
          user.id === existingUser.id ? { ...userData, id: existingUser.id } : user
        );
        setUsers(updatedUsers);
        
        toast({
          title: 'Sucesso',
          description: 'Usuário atualizado com sucesso.',
        });
      } else {
        // Create new user
        const newUser = { 
          ...userData, 
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        setUsers([...users, newUser]);
        
        toast({
          title: 'Sucesso',
          description: 'Usuário criado com sucesso.',
        });
      }

      // TODO: Implement actual database operations with the new RLS policies
      /*
      if (existingUser) {
        const { error } = await supabase
          .from('saas_client_user_assignments')
          .update({
            role: userData.role,
            is_active: userData.status === 'active'
          })
          .eq('user_id', existingUser.id);

        if (error) throw error;
      } else {
        // Create new user assignment
        const { error } = await supabase
          .from('saas_client_user_assignments')
          .insert({
            user_id: userData.id, // This would come from creating the auth user first
            client_id: currentClientId, // From multi-tenant context
            role: userData.role,
            is_active: userData.status === 'active'
          });

        if (error) throw error;
      }
      */
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
