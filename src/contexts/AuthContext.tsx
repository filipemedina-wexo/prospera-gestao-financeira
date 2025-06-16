
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { AppUser, AuthContextType } from '@/types/auth';
import { fetchUserData } from '@/services/userService';
import { loginUser, logoutUser, signUpUser } from '@/services/authService';
import { checkUserPermission } from '@/utils/permissions';
import { logSecurityEvent } from '@/utils/securityLogger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAndSetUser = async (supabaseUser: SupabaseUser) => {
    try {
      const appUser = await fetchUserData(supabaseUser);
      setUser(appUser);
      await logSecurityEvent('USER_LOGIN', 'auth', true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      await logSecurityEvent('USER_DATA_FETCH', 'auth', false, 'Failed to fetch user data');
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do usuário.',
        variant: 'destructive',
      });
    }
  };
  
  useEffect(() => {
    console.log('Initializing auth context...');
    let mounted = true;

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in');
        await fetchAndSetUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        await logSecurityEvent('USER_LOGOUT', 'auth', true);
      }
      
      setLoading(false);
    });

    // Check for existing session
    const initializeSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }

        if (mounted) {
          if (session?.user) {
            console.log('Found existing session');
            await fetchAndSetUser(session.user);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeSession();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    
    if (result.error) {
      toast({ 
        title: 'Erro de Login', 
        description: result.error.message, 
        variant: 'destructive' 
      });
    } else {
      toast({ title: 'Login bem-sucedido!' });
    }
    
    return result;
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      toast({ title: 'Você saiu da sua conta.' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const signUp = async (data: { email: string; password: string; fullName: string; }) => {
    const result = await signUpUser(data);
    
    if (result.error) {
      toast({ title: 'Erro no Cadastro', description: result.error.message, variant: 'destructive' });
    } else {
      toast({
        title: 'Cadastro Realizado!',
        description: 'Enviamos um email de confirmação para você. Por favor, verifique sua caixa de entrada.',
      });
    }
    
    return result;
  };

  const hasPermission = (permission: string): boolean => {
    return checkUserPermission(user, permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signUp, hasPermission, loading }}>
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
