
import { useState, useEffect } from 'react';
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
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

// Security utility functions
const logSecurityEvent = async (
  action: string,
  resourceType: string,
  resourceId?: string,
  success: boolean = true,
  errorMessage?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.rpc('log_security_event', {
      p_user_id: user?.id || null,
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_success: success,
      p_error_message: errorMessage
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
    console.error('Failed to generate secure password, using fallback');
    // Fallback to client-side generation if function fails
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

// Send welcome email with login credentials
const sendWelcomeEmail = async (user: any, temporaryPassword: string) => {
  try {
    console.log('Sending welcome email to:', user.email);
    
    const { data, error } = await supabase.functions.invoke('send-welcome-email', {
      body: { 
        user: user,
        temporaryPassword: temporaryPassword
      },
    });

    if (error) {
      console.error('Error invoking welcome email function:', error);
      throw error;
    }

    console.log('Welcome email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

export function useUsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { currentClientId, isSupperAdmin } = useMultiTenant();

  const canManageUsers = hasPermission('gestao-usuarios.view') || isSupperAdmin;

  const fetchUsers = async () => {
    if (!canManageUsers) return;

    setLoading(true);
    try {
      await logSecurityEvent('FETCH_USERS', 'users');

      // Fetch user profiles first
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');

      if (profilesError) throw profilesError;

      // Fetch user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch auth users to get email
      const { data: authUsersResponse, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const authUsersList: AuthUser[] = authUsersResponse?.users?.map(user => ({
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null
      })) || [];

      // Handle the case when profiles is null or empty
      if (!profiles || profiles.length === 0) {
        setUsers([]);
        return;
      }

      // Process profiles with proper type handling
      const validProfiles: ProfileData[] = [];
      for (const profile of profiles) {
        if (
          profile &&
          typeof profile === 'object' &&
          'id' in profile &&
          typeof profile.id === 'string' &&
          profile.id.length > 0
        ) {
          validProfiles.push({
            id: profile.id,
            full_name: typeof profile.full_name === 'string' ? profile.full_name : null,
          });
        }
      }

      // Process user roles with proper type handling
      const validUserRoles: UserRoleData[] = [];
      if (userRoles) {
        for (const roleData of userRoles) {
          if (
            roleData &&
            typeof roleData === 'object' &&
            'user_id' in roleData &&
            'role' in roleData &&
            typeof roleData.user_id === 'string' &&
            typeof roleData.role === 'string'
          ) {
            validUserRoles.push({
              user_id: roleData.user_id,
              role: roleData.role as ExtendedRole,
            });
          }
        }
      }

      // Create users array with explicit typing
      const combinedUsers: User[] = validProfiles.map((profile: ProfileData) => {
        const authUser = authUsersList.find((u) => u.id === profile.id);
        const userRole = validUserRoles.find((roleData) => roleData.user_id === profile.id);
        const role = userRole?.role || 'contador';

        return {
          id: profile.id,
          name: profile.full_name || 'Sem nome',
          email: authUser?.email || 'email@exemplo.com',
          role: role,
          status: 'active' as const,
          createdAt: authUser?.created_at || new Date().toISOString(),
          lastLogin: authUser?.last_sign_in_at || undefined,
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users');
      await logSecurityEvent('FETCH_USERS', 'users', undefined, false, 'Failed to fetch users');
      toast({
        title: 'Erro',
        description: 'Erro ao carregar usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData: User, selectedUser: User | null) => {
    try {
      if (selectedUser) {
        // Update existing user
        await logSecurityEvent('UPDATE_USER', 'user', selectedUser.id);

        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: userData.name })
          .eq('id', selectedUser.id);

        if (profileError) throw profileError;

        // Update user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: userData.role })
          .eq('user_id', selectedUser.id);

        if (roleError) throw roleError;

        toast({
          title: 'Usuário atualizado',
          description: 'Dados do usuário foram atualizados com sucesso.',
        });
      } else {
        // Create new user with secure password
        const securePassword = await generateSecurePassword();
        
        await logSecurityEvent('CREATE_USER', 'user', undefined, true, undefined);

        const { data, error: signUpError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: securePassword,
          email_confirm: true,
          user_metadata: {
            full_name: userData.name,
          },
        });

        if (signUpError) throw signUpError;

        // Add user role
        if (data.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: userData.role,
            });

          if (roleError) throw roleError;

          // If we have a current client, associate the user with it
          if (currentClientId) {
            const { error: mappingError } = await supabase
              .from('saas_user_client_mapping')
              .insert({
                user_id: data.user.id,
                client_id: currentClientId,
                role: 'user',
                is_active: true,
              });

            if (mappingError) {
              console.error('Error creating client mapping');
              await logSecurityEvent('CREATE_USER_CLIENT_MAPPING', 'user_client_mapping', data.user.id, false, 'Failed to create client mapping');
            }
          }

          // Send welcome email with login credentials
          try {
            await sendWelcomeEmail(data.user, securePassword);
            console.log('Welcome email sent successfully');
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the user creation if email fails
            toast({
              title: 'Usuário criado',
              description: `Usuário criado com sucesso, mas houve erro ao enviar email de boas-vindas. Senha temporária: ${securePassword}`,
              variant: 'default',
            });
          }

          // Log successful user creation
          await logSecurityEvent('CREATE_USER', 'user', data.user.id, true);
        }

        toast({
          title: 'Usuário criado',
          description: 'Novo usuário foi criado com sucesso e um email de boas-vindas foi enviado.',
        });
      }

      fetchUsers();
    } catch (error) {
      console.error('Error saving user');
      await logSecurityEvent(
        selectedUser ? 'UPDATE_USER' : 'CREATE_USER',
        'user',
        selectedUser?.id,
        false,
        'Failed to save user'
      );
      toast({
        title: 'Erro',
        description: 'Erro ao salvar usuário.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [canManageUsers]);

  return {
    users,
    loading,
    canManageUsers,
    fetchUsers,
    saveUser,
  };
}
