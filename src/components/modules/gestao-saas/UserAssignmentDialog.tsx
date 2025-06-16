
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Trash2,
  UserPlus,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type SaasClient = Tables<'saas_clients'>;
type UserAssignment = Tables<'saas_client_user_assignments'>;

interface UserAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: SaasClient;
  onUpdate: () => void;
}

interface AssignmentWithProfile extends UserAssignment {
  user_profile?: {
    full_name: string;
    email: string;
  };
}

export function UserAssignmentDialog({ isOpen, onClose, client, onUpdate }: UserAssignmentDialogProps) {
  const [assignments, setAssignments] = useState<AssignmentWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && client) {
      fetchUserAssignments();
    }
  }, [isOpen, client]);

  const fetchUserAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saas_client_user_assignments')
        .select(`
          *,
          user_profile:profiles!inner(full_name)
        `)
        .eq('client_id', client.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch user emails from auth.users (via RPC or another method)
      const assignmentsWithProfiles = await Promise.all(
        (data || []).map(async (assignment) => {
          try {
            // Since we can't directly query auth.users, we'll use the profile data
            return {
              ...assignment,
              user_profile: {
                full_name: assignment.user_profile?.full_name || 'Nome não disponível',
                email: 'Email não disponível' // Would need to implement a way to get email
              }
            };
          } catch (error) {
            return {
              ...assignment,
              user_profile: {
                full_name: 'Nome não disponível',
                email: 'Email não disponível'
              }
            };
          }
        })
      );

      setAssignments(assignmentsWithProfiles);
    } catch (error) {
      console.error('Error fetching user assignments:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar atribuições de usuários.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdminUser = async () => {
    if (!newUserEmail || !newUserName) {
      toast({
        title: 'Erro',
        description: 'Email e nome são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('create_client_admin_user', {
        client_id_param: client.id,
        admin_email: newUserEmail,
        admin_name: newUserName
      });

      if (error) throw error;

      toast({
        title: 'Usuário Admin Criado',
        description: `Admin criado com sucesso. Senha temporária: ${data.temporary_password}`,
      });

      setShowAddForm(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('user');
      fetchUserAssignments();
      onUpdate();
    } catch (error) {
      console.error('Error creating admin user:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao criar usuário admin.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('saas_client_user_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: 'Usuário Removido',
        description: 'Usuário removido do cliente com sucesso.',
      });

      fetchUserAssignments();
      onUpdate();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover usuário.',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Admin', variant: 'destructive' as const },
      user: { label: 'Usuário', variant: 'default' as const },
      manager: { label: 'Gerente', variant: 'secondary' as const },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || 
                  { label: role, variant: 'outline' as const };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Usuários: {client.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botão para adicionar usuário */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Usuários Atribuídos</h3>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Admin
            </Button>
          </div>

          {/* Formulário para adicionar usuário */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Criar Usuário Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="admin@empresa.com"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Nome do Admin"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="user">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateAdminUser} disabled={loading}>
                    Criar Usuário
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de usuários */}
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <p className="text-center text-muted-foreground">Carregando usuários...</p>
              ) : assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{assignment.user_profile?.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{assignment.user_profile?.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getRoleBadge(assignment.role)}
                            <span className="text-xs text-muted-foreground">
                              Atribuído em {new Date(assignment.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário atribuído a este cliente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
