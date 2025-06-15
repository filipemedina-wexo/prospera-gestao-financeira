
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserClientMapping {
  id: string;
  user_id: string;
  client_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useClientMapping = () => {
  const { user } = useAuth();
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCurrentClientId(null);
      setLoading(false);
      return;
    }

    const fetchClientMapping = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('saas_user_client_mapping')
          .select('client_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching client mapping:', error);
          setError(error.message);
          return;
        }

        setCurrentClientId(data?.client_id || null);
      } catch (err) {
        console.error('Error in fetchClientMapping:', err);
        setError('Erro ao buscar mapeamento do cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchClientMapping();
  }, [user]);

  const assignUserToClient = async (clientId: string, role: string = 'user') => {
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('saas_user_client_mapping')
      .insert({
        user_id: user.id,
        client_id: clientId,
        role,
        is_active: true,
      });

    if (error) {
      throw new Error(`Erro ao associar usuário ao cliente: ${error.message}`);
    }

    setCurrentClientId(clientId);
  };

  const removeUserFromClient = async (clientId: string) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('saas_user_client_mapping')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('client_id', clientId);

    if (error) {
      throw new Error(`Erro ao remover usuário do cliente: ${error.message}`);
    }

    if (currentClientId === clientId) {
      setCurrentClientId(null);
    }
  };

  return {
    currentClientId,
    loading,
    error,
    assignUserToClient,
    removeUserFromClient,
  };
};
