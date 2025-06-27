
import { User } from '@/data/users';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown';

interface UsersTableProps {
  users: User[];
  onEditUser: (user: User) => void;
}

export function UsersTable({ users, onEditUser }: UsersTableProps) {
  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
    } as const;

    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      suspended: 'Suspenso',
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      admin: 'default',
      super_admin: 'destructive',
      financeiro: 'secondary',
      comercial: 'outline',
      contador: 'secondary',
    } as const;

    return (
      <Badge variant={variants[role]} className="capitalize">
        {role === 'super_admin' ? 'Super Admin' : role}
      </Badge>
    );
  };

  const formatLastLogin = (lastLogin?: string) => {
    if (!lastLogin) return 'Nunca';
    
    return formatDistanceToNow(new Date(lastLogin), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const getActionsForUser = (user: User): ActionItem[] => [
    {
      type: 'edit',
      label: 'Editar',
      onClick: () => onEditUser(user),
    }
  ];

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último Login</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>{formatLastLogin(user.lastLogin)}</TableCell>
              <TableCell className="text-right">
                <ActionsDropdown actions={getActionsForUser(user)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
