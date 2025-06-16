
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(true);

  // Debounced fetch function
  const debouncedFetch = useCallback((userId: string) => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;

      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('saas_user_client_mapping')
          .select('client_id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (!mountedRef.current) return;

        if (error) {
          console.error('Error fetching client mapping:', error);
          setError(error.message);
          return;
        }

        setCurrentClientId(data?.client_id || null);
      } catch (err) {
        if (!mountedRef.current) return;
        console.error('Error in fetchClientMapping:', err);
        setError('Erro ao buscar mapeamento do cliente');
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    }, 300); // 300ms debounce
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (!user?.id) {
      setCurrentClientId(null);
      setLoading(false);
      setError(null);
      return;
    }

    debouncedFetch(user.id);

    return () => {
      mountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [user?.id, debouncedFetch]);

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
