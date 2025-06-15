
import { createContext, useState, useContext, ReactNode } from 'react';
import { User, users } from '@/data/users';
import { useToast } from "@/hooks/use-toast";
import { permissionsByRole } from '@/config/permissions';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
    return null;
  });
  const { toast } = useToast();

  const login = (email: string, password: string): boolean => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      if (foundUser.status !== 'active') {
        toast({ title: 'Acesso Negado', description: `Sua conta está ${foundUser.status === 'inactive' ? 'inativa' : 'suspensa'}. Contate o administrador.`, variant: 'destructive' });
        return false;
      }
      const { password, ...userToStore } = foundUser;
      setUser(userToStore as User);
      localStorage.setItem('user', JSON.stringify(userToStore));
      toast({ title: `Bem-vindo, ${foundUser.name}!` });
      return true;
    }
    toast({ title: 'Erro de Login', description: 'Email ou senha inválidos.', variant: 'destructive' });
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast({ title: 'Você saiu da sua conta.' });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    const userPermissions = permissionsByRole[user.role];
    if (!userPermissions) return false;
    
    if (userPermissions.includes('*')) return true;
    
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
