
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus } from 'lucide-react';

interface UsersManagementHeaderProps {
  onAddUser: () => void;
}

export function UsersManagementHeader({ onAddUser }: UsersManagementHeaderProps) {
  return (
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
      <Button onClick={onAddUser}>
        <UserPlus className="mr-2 h-4 w-4" />
        Novo Usuário
      </Button>
    </CardHeader>
  );
}
