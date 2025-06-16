
import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { permissionsByRole, ExtendedRole } from '@/config/permissions';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, AuthError } from '@supabase/supabase-js';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: ExtendedRole | null;
}

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  signUp: (data: { email: string; password: string; fullName: string; }) => Promise<{ data: any, error: AuthError | null }>;
  hasPermission: (permission: string) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Security logging utility
const logSecurityEvent = async (
  action: string,
  resourceType: string,
  success: boolean = true,
  errorMessage?: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.rpc('log_security_event', {
      p_user_id: user?.id || null,
      p_action: action,
      p_resource_type: resourceType,
      p_success: success,
      p_error_message: errorMessage
    });
  } catch (error) {
    // Silent fail for logging to prevent infinite loops
  }
};

// Cleanup function for auth state
const cleanupAuthState = () => {
  console.log('Cleaning up auth state...');
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAndSetUser = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('Fetching user data for:', supabaseUser.id);
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, welcome_email_sent')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      const appUser: AppUser = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        name: profileData?.full_name || supabaseUser.email!,
        role: (roleData?.role as ExtendedRole) || null,
      };
      
      console.log('User data fetched successfully:', appUser);
      setUser(appUser);

      // Log successful login
      await logSecurityEvent('USER_LOGIN', 'auth', true);

      // If user is confirmed and welcome email hasn't been sent, send it
      if (supabaseUser.email_confirmed_at && !profileData?.welcome_email_sent) {
        try {
          const { error } = await supabase.functions.invoke('send-welcome-email', {
            body: { user: supabaseUser },
          });
          
          if (error) {
            console.error('Error sending welcome email');
          }
        } catch (error) {
          console.error('Error invoking welcome email function');
        }
      }
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

    const initializeAuth = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }

        if (mounted) {
          if (session?.user) {
            console.log('Found existing session, fetching user data...');
            await fetchAndSetUser(session.user);
          } else {
            console.log('No existing session found');
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (mounted) {
          setLoading(false);
          toast({
            title: 'Erro de Conexão',
            description: 'Problema ao conectar com o servidor. Tente novamente.',
            variant: 'destructive',
          });
        }
      }
    };

    // Emergency fallback - prevent infinite loading
    const emergencyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 8000);

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in, fetching user data...');
        try {
          await fetchAndSetUser(session.user);
        } catch (error) {
          console.error('Error handling sign in:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        await logSecurityEvent('USER_LOGOUT', 'auth', true);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(emergencyTimeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('Attempting login for:', email);
    
    try {
      // Clean up any existing auth state first
      cleanupAuthState();
      
      // Attempt global sign out first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed, continuing...');
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        await logSecurityEvent('USER_LOGIN_FAILED', 'auth', false, error.message);
        toast({ 
          title: 'Erro de Login', 
          description: error.message, 
          variant: 'destructive' 
        });
        return { error };
      } else {
        console.log('Login successful');
        toast({ title: 'Login bem-sucedido!' });
        return { error: null };
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      toast({
        title: 'Erro de Login',
        description: 'Erro inesperado durante o login. Tente novamente.',
        variant: 'destructive',
      });
      return { error: error as AuthError };
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      toast({ title: 'Você saiu da sua conta.' });
      
      // Force page refresh for clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force refresh even if logout fails
      window.location.href = '/login';
    }
  };

  const signUp = async ({ email, password, fullName }: { email: string; password: string; fullName: string; }) => {
    console.log('Attempting signup for:', email);
    
    try {
      // Clean up any existing auth state
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        await logSecurityEvent('USER_SIGNUP_FAILED', 'auth', false, error.message);
        toast({ title: 'Erro no Cadastro', description: error.message, variant: 'destructive' });
      } else {
        console.log('Signup successful');
        await logSecurityEvent('USER_SIGNUP', 'auth', true);
        toast({
          title: 'Cadastro Realizado!',
          description: 'Enviamos um email de confirmação para você. Por favor, verifique sua caixa de entrada.',
        });
      }
      return { data, error };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: 'Erro no Cadastro',
        description: 'Erro inesperado durante o cadastro. Tente novamente.',
        variant: 'destructive',
      });
      return { data: null, error: error as AuthError };
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role) {
      return false;
    }

    const userPermissions = permissionsByRole[user.role];
    if (!userPermissions) {
      return false;
    }
    
    if (userPermissions.includes('*')) {
      return true;
    }
    
    const hasAccess = userPermissions.includes(permission);
    
    return hasAccess;
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
