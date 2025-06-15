
import { useState } from 'react';
import { users as initialUsers, User } from '@/data/users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UserDialog } from './UserDialog';
import { useToast } from '@/hooks/use-toast';

export function GestaoUsuarios() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleSaveUser = (user: User) => {
    // NOTE: Esta função atualmente suporta apenas a adição de novos usuários.
    setUsers(prevUsers => [...prevUsers, user]);
    toast({ title: 'Usuário Adicionado!', description: 'O novo usuário foi adicionado com sucesso.'});
  };
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  }

  const getStatusBadgeClass = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100/90 dark:bg-green-900/50 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/90 dark:bg-gray-800 dark:text-gray-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 hover:bg-red-100/90 dark:bg-red-900/50 dark:text-red-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema, permissões e status.
          </p>
        </div>
        <Button onClick={handleAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
           <CardDescription>
            Um total de {users.length} usuários encontrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize border-none', getStatusBadgeClass(user.status))}>
                      {user.status === 'active' ? 'Ativo' : user.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(user.createdAt), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {user.lastLogin ? format(new Date(user.lastLogin), 'dd/MM/yyyy HH:mm') : 'Nunca'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Alterar Status</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500 hover:!text-red-500 hover:!bg-red-100/50">
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <UserDialog
        isOpen={isUserDialogOpen}
        setIsOpen={setIsUserDialogOpen}
        onSave={handleSaveUser}
        userToEdit={selectedUser}
      />
    </div>
  );
}
