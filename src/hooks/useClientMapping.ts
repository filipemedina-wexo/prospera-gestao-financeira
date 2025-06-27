
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
  const { user, loading: authLoading } = useAuth();
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);

  const fetchClientMapping = useCallback(async (userId: string, attempt: number = 0) => {
    if (!mountedRef.current) return;

    try {
      console.log(`Fetching client mapping for user ${userId}, attempt ${attempt + 1}`);
      setLoading(true);
      setError(null);

      // Get the current session to ensure we're authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log('No active session found');
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }

      // Use the database function instead of direct query to avoid multiple rows issue
      const { data, error } = await supabase.rpc('get_user_client_id');

      if (!mountedRef.current) return;

      if (error) {
        console.error('Error fetching client mapping:', error);
        
        // If it's an auth error and we have attempts left, retry
        if ((error.code === 'PGRST301' || error.message.includes('JSON object requested')) && attempt < 3) {
          console.log(`Auth/JSON error, retrying in 1 second... (attempt ${attempt + 1}/3)`);
          setRetryCount(attempt + 1);
          
          setTimeout(() => {
            if (mountedRef.current) {
              fetchClientMapping(userId, attempt + 1);
            }
          }, 1000);
          return;
        }
        
        setError(`Erro ao buscar mapeamento: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Client mapping found:', data);
        setCurrentClientId(data);
        setRetryCount(0);
        setLoading(false);
        return;
      }

      // No client mapping found, implement retry with exponential backoff
      const maxRetries = 8; // Will retry for roughly 25 seconds total
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(1.5, attempt), 5000); // Cap at 5 seconds
        console.log(`No client mapping found, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        
        setRetryCount(attempt + 1);
        
        setTimeout(() => {
          if (mountedRef.current) {
            fetchClientMapping(userId, attempt + 1);
          }
        }, delay);
      } else {
        console.error('Max retry attempts reached, no client mapping found');
        setError('Não foi possível encontrar o cliente associado. Tente recarregar a página.');
        setLoading(false);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      console.error('Error in fetchClientMapping:', err);
      setError('Erro ao buscar mapeamento do cliente');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Don't start loading if auth is still loading
    if (authLoading) {
      setLoading(false);
      return;
    }

    if (!user?.id) {
      setCurrentClientId(null);
      setLoading(false);
      setError(null);
      setRetryCount(0);
      return;
    }

    // Add a small delay to ensure the auth session is fully established
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && user?.id) {
        fetchClientMapping(user.id);
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
    };
  }, [user?.id, authLoading, fetchClientMapping]);

  const assignUserToClient = async (clientId: string, role: string = 'user') => {
    if (!user) throw new Error('Usuário não autenticado');

    // First, deactivate any existing mappings for this user
    const { error: deactivateError } = await supabase
      .from('saas_user_client_mapping')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (deactivateError) {
      console.error('Error deactivating existing mappings:', deactivateError);
    }

    // Then create the new mapping
    const { error } = await supabase
      .from('saas_user_client_mapping')
      .insert({
        user_id: user.id,
        client_id: clientId,
        role,
        is_active: true,
      });

    if (error) {
      // If the error is due to the unique constraint, update the existing row
      if (error.message.includes('duplicate key value')) {
        const { error: updateError } = await supabase
          .from('saas_user_client_mapping')
          .update({ client_id: clientId, role })
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (updateError) {
          throw new Error(`Erro ao associar usuário ao cliente: ${updateError.message}`);
        }
      } else {
        throw new Error(`Erro ao associar usuário ao cliente: ${error.message}`);
      }
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
    retryCount,
    assignUserToClient,
    removeUserFromClient,
  };
};
