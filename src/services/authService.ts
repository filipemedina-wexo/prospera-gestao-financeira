
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';
import { logSecurityEvent } from '@/utils/securityLogger';
import { SignUpData } from '@/types/auth';

export const loginUser = async (email: string, password: string) => {
  
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
      return { error: null };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected login error:', error);
    return { error: error as AuthError };
  }
};

export const logoutUser = async () => {
  
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const signUpUser = async ({ email, password, fullName }: SignUpData) => {
  
  try {
    // Use atomic onboarding edge function instead of direct signup
    const { data, error } = await supabase.functions.invoke('atomic-onboarding', {
      body: {
        email,
        password,
        fullName,
        companyName: fullName, // Use fullName as fallback for companyName
        contactName: fullName,
        contactEmail: email,
      },
    });

    if (error) {
      console.error('Atomic onboarding error:', error);
      await logSecurityEvent('USER_SIGNUP_FAILED', 'auth', false, error.message);
      return { data: null, error: error as AuthError };
    } 
    
    if (data?.success) {
      await logSecurityEvent('USER_SIGNUP', 'auth', true);
      return { data: data.user, error: null };
    } else {
      const errorMessage = data?.message || 'Falha no onboarding';
      await logSecurityEvent('USER_SIGNUP_FAILED', 'auth', false, errorMessage);
      return { data: null, error: { message: errorMessage } as AuthError };
    }
  } catch (error) {
    console.error('Unexpected signup error:', error);
    return { data: null, error: error as AuthError };
  }
};
