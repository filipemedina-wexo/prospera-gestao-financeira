
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
  try {
    const authContext = useAuth();
    
    // Ensure we have the auth context before proceeding
    if (!authContext) {
      console.error('MultiTenantProvider: No auth context available');
      throw new Error('MultiTenantProvider must be used within an AuthProvider');
    }
    
    const { user, hasPermission } = authContext;
    const { currentClientId, loading, error, assignUserToClient, removeUserFromClient } = useClientMapping();

    const isSupperAdmin = hasPermission('saas.manage');

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
  } catch (error) {
    console.error('MultiTenantProvider error:', error);
    // Return children without context if there's an error
    return <>{children}</>;
  }
};

export const useMultiTenant = () => {
  const context = useContext(MultiTenantContext);
  if (context === undefined) {
    throw new Error('useMultiTenant must be used within a MultiTenantProvider');
  }
  return context;
};
