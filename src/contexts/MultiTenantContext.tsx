
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
}

const MultiTenantContext = createContext<MultiTenantContextType | undefined>(undefined);

export const MultiTenantProvider = ({ children }: { children: ReactNode }) => {
  const authContext = useAuth();
  
  // Provide fallback values if auth context is not available yet
  const { user, hasPermission } = authContext || { user: null, hasPermission: () => false };
  const { currentClientId, loading, error, assignUserToClient, removeUserFromClient } = useClientMapping();

  const isSupperAdmin = user ? hasPermission('saas.manage') : false;

  return (
    <MultiTenantContext.Provider
      value={{
        currentClientId,
        loading,
        error,
        assignUserToClient,
        removeUserFromClient,
        isSupperAdmin,
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
