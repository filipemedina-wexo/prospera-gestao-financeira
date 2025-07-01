
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { ExtendedRole } from '@/config/permissions';
import { AppUser } from '@/types/auth';
import { logSecurityEvent } from '@/utils/securityLogger';

export const fetchUserData = async (supabaseUser: SupabaseUser): Promise<AppUser> => {
  
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
  

  // Send welcome email if needed
  if (supabaseUser.email_confirmed_at && !profileData?.welcome_email_sent) {
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: { user: supabaseUser },
      });
    } catch (error) {
      console.error('Error sending welcome email');
    }
  }

  return appUser;
};
