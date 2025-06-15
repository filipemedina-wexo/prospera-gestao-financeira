import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserDialog } from './UserDialog';
import { UsersTable } from './UsersTable';
import { User } from '@/data/users';
import { ExtendedRole } from '@/config/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { useMultiTenant } from '@/contexts/MultiTenantContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ProfileData {
  id: string;
  full_name: string | null;
}

interface UserRoleData {
  user_id: string;
  role: string;
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const { currentClientId, isSupperAdmin } = useMultiTenant();

  // Check if user has permission to manage users
  const canManageUsers = hasPermission('gestao-usuarios.view') || isSupperAdmin;

  const fetchUsers = async () => {
    if (!canManageUsers) return;
    
    setLoading(true);
    try {
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
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      // Handle the case when profiles is null or empty
      if (!profiles || profiles.length === 0) {
        setUsers([]);
        return;
      }

      // Type assertion after null check to help TypeScript
      const validProfiles = profiles as ProfileData[];
      const validUserRoles = userRoles as UserRoleData[] | null;

      // Combine the data with proper typing
      const combinedUsers: User[] = validProfiles.map((profile) => {
        const authUser = authUsers.users.find(u => u.id === profile.id);
        // Fix the TypeScript error by being more explicit with the type
        const userRole = validUserRoles ? validUserRoles.find((r: UserRoleData) => r.user_id === profile.id) : undefined;
        const role = (userRole?.role as ExtendedRole) || 'contador';
        
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

  useEffect(() => {
    fetchUsers();
  }, [canManageUsers]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSaveUser = async (userData: User) => {
    try {
      if (selectedUser) {
        // Update existing user
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
        // Create new user via auth
        const { data, error: signUpError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password || 'temppassword123',
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

            if (mappingError) console.error('Error creating client mapping:', mappingError);
          }
        }

        toast({
          title: 'Usuário criado',
          description: 'Novo usuário foi criado com sucesso.',
        });
      }

      fetchUsers();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar usuário.',
        variant: 'destructive',
      });
    }
  };

  if (!canManageUsers) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Acesso Negado</AlertTitle>
        <AlertDescription>
          Você não tem permissão para acessar a gestão de usuários.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestão de Usuários
            </CardTitle>
            <CardDescription>
              Gerencie usuários e suas permissões no sistema.
            </CardDescription>
          </div>
          <Button onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando usuários...</div>
          ) : (
            <UsersTable 
              users={users}
              onEditUser={handleEditUser}
            />
          )}
        </CardContent>
      </Card>

      <UserDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        onSave={handleSaveUser}
        userToEdit={selectedUser}
      />
    </div>
  );
}
