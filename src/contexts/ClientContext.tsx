import { createContext, useContext, ReactNode, useState } from 'react';

interface ClientContextType {
  clientName: string;
  clientSubtitle: string;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

// In a real app, this data would likely come from an API.
// For now, we'll keep it here for easy configuration.
const defaultClientData = {
    clientName: 'Sua Empresa',
    clientSubtitle: 'Gestão Financeira',
};

export const ClientProvider = ({ children }: { children: ReactNode }) => {
  const [client] = useState(defaultClientData);

  const value = {
    clientName: client.clientName,
    clientSubtitle: client.clientSubtitle,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
