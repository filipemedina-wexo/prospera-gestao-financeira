
import { CardContent } from '@/components/ui/card';
import { UsersTable } from '../UsersTable';
import { User } from '@/data/users';

interface UsersManagementContentProps {
  users: User[];
  loading: boolean;
  onEditUser: (user: User) => void;
}

export function UsersManagementContent({ users, loading, onEditUser }: UsersManagementContentProps) {
  if (loading) {
    return (
      <CardContent>
        <div className="text-center py-4">Carregando usuários...</div>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <UsersTable 
        users={users}
        onEditUser={onEditUser}
      />
    </CardContent>
  );
}
