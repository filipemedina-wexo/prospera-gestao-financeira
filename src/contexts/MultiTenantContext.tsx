
import { createContext, useContext, ReactNode } from 'react';
import { useClientMapping } from '@/hooks/useClientMapping';
import { useAuth } from '@/contexts/AuthContext';

interface MultiTenantContextType {
  currentClientId: string | null;
  loading: boolean;
  error: string | null;
  assignUserToClient: (clientId: string, role?: string) => Promise<void>;
  removeUserFromClient: (clientId: string) => Promise<void>;
  isSupperAdmin: boolean;
  hasClientMapping: boolean;
}

const MultiTenantContext = createContext<MultiTenantContextType | undefined>(undefined);

export const MultiTenantProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useAuth();
  
  // Check if auth context is available and user is loaded
  const { user, hasPermission, loading: authLoading } = authContext || { 
    user: null, 
    hasPermission: () => false, 
    loading: true 
  };

  const { currentClientId, loading: clientLoading, error, assignUserToClient, removeUserFromClient } = useClientMapping();

  // Calculate loading state - we're loading if auth is loading OR if we have a user but client mapping is still loading
  const loading = authLoading || (user && clientLoading);
  
  const isSupperAdmin = user ? hasPermission('saas.manage') : false;
  const hasClientMapping = !!currentClientId;

  return (
    <MultiTenantContext.Provider
      value={{
        currentClientId,
        loading,
        error,
        assignUserToClient,
        removeUserFromClient,
        isSupperAdmin,
        hasClientMapping,
      }}
    >
      {children}
    </MultiTenantContext.Provider>
  );
};

export const useMultiTenant = () => {
  const context = useContext(MultiTenantContext);
  if (context === undefined) {
    throw new Error('useMultiTenant must be used within a MultiTenantProvider');
  }
  return context;
};
