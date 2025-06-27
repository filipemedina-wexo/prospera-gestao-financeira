import { supabase } from '@/integrations/supabase/client';

export const getCurrentClientId = async (): Promise<string | null> => {
  const { data, error } = await supabase.rpc('get_user_client_id');
  if (error) {
    throw new Error(`Erro ao obter cliente atual: ${error.message}`);
  }
  return data;
};
