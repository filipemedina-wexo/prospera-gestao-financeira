
import { createContext, useState, useContext, ReactNode } from 'react';
import { User, users } from '@/data/users';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const login = (email: string, password: string): boolean => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password, ...userToStore } = foundUser;
      setUser(userToStore as User);
      toast({ title: `Bem-vindo, ${foundUser.name}!` });
      return true;
    }
    toast({ title: 'Erro de Login', description: 'Email ou senha inválidos.', variant: 'destructive' });
    return false;
  };

  const logout = () => {
    setUser(null);
    toast({ title: 'Você saiu da sua conta.' });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return user.permissions.includes(permission);
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
