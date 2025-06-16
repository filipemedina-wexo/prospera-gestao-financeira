
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { logSecurityEvent } from '@/utils/securityLogger';
import { SignUpData } from '@/types/auth';

export const loginUser = async (email: string, password: string) => {
  console.log('Attempting login for:', email);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      console.error('Login error:', error);
      await logSecurityEvent('USER_LOGIN_FAILED', 'auth', false, error.message);
      return { error };
    } 
    
    if (data.user) {
      console.log('Login successful');
      return { error: null };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected login error:', error);
    return { error: error as AuthError };
  }
};

export const logoutUser = async () => {
  console.log('Logging out user');
  
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const signUpUser = async ({ email, password, fullName }: SignUpData) => {
  console.log('Attempting signup for:', email);
  
  try {
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
    } else {
      console.log('Signup successful');
      await logSecurityEvent('USER_SIGNUP', 'auth', true);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Unexpected signup error:', error);
    return { data: null, error: error as AuthError };
  }
};
