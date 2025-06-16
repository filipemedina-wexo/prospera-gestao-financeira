
import { supabase } from '@/integrations/supabase/client';

export const logSecurityEvent = async (
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
