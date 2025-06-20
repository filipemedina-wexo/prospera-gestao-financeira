import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { UserDialog } from './UserDialog';
import { User } from '@/data/users';
import { useUsersManagement } from './hooks/useUsersManagement';
import { UsersManagementHeader } from './components/UsersManagementHeader';
import { UsersManagementContent } from './components/UsersManagementContent';
import { AccessDeniedAlert } from './components/AccessDeniedAlert';

interface UsersManagementProps {
  isActive: boolean; // Adicionamos esta prop
}

export function UsersManagement({ isActive }: UsersManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Passamos o `isActive` para o hook
  const { users, loading, canManageUsers, saveUser } = useUsersManagement(isActive);

  const handleAddUser = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleSaveUser = async (userData: User) => {
    await saveUser(userData, selectedUser);
    setDialogOpen(false);
  };

  if (!canManageUsers) {
    return <AccessDeniedAlert />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <UsersManagementHeader onAddUser={handleAddUser} />
        <UsersManagementContent 
          users={users}
          loading={loading}
          onEditUser={handleEditUser}
        />
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