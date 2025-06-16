
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAndSetUser = async (supabaseUser: SupabaseUser) => {
    try {
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
      
      // Remove sensitive logging - only log the action, not the data
      console.log('User authentication successful');
      
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
      console.error('Error fetching user data');
      await logSecurityEvent('USER_DATA_FETCH', 'auth', false, 'Failed to fetch user data');
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do usuário.',
        variant: 'destructive',
      });
    }
  };
  
  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchAndSetUser(session.user);
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        await fetchAndSetUser(session.user);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        await logSecurityEvent('USER_LOGOUT', 'auth', true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      await logSecurityEvent('USER_LOGIN_FAILED', 'auth', false, error.message);
      toast({ title: 'Erro de Login', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Login bem-sucedido!' });
    }
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({ title: 'Você saiu da sua conta.' });
  };

  const signUp = async ({ email, password, fullName }: { email: string; password: string; fullName: string; }) => {
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
      await logSecurityEvent('USER_SIGNUP_FAILED', 'auth', false, error.message);
      toast({ title: 'Erro no Cadastro', description: error.message, variant: 'destructive' });
    } else {
      await logSecurityEvent('USER_SIGNUP', 'auth', true);
      toast({
        title: 'Cadastro Realizado!',
        description: 'Enviamos um email de confirmação para você. Por favor, verifique sua caixa de entrada.',
      });
    }
    return { data, error };
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
