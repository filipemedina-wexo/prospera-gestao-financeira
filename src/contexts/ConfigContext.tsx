
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ConfigContextType {
  companyName: string;
  setCompanyName: (name: string) => void;
  companyEmail: string;
  setCompanyEmail: (email: string) => void;
  companyCNPJ: string;
  setCompanyCNPJ: (cnpj: string) => void;
  companyAddress: string;
  setCompanyAddress: (address: string) => void;
  companyPhone: string;
  setCompanyPhone: (phone: string) => void;
  companyLogo: string | null;
  setCompanyLogo: (logo: string | null) => void;
  saveConfig: () => void;
  loadConfig: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const CONFIG_STORAGE_KEY = 'company_config';

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [companyName, setCompanyName] = useState('Sua Empresa');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyCNPJ, setCompanyCNPJ] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  const saveConfig = () => {
    const config = {
      companyName,
      companyEmail,
      companyCNPJ,
      companyAddress,
      companyPhone,
      companyLogo,
    };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  };

  const loadConfig = () => {
    const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setCompanyName(config.companyName || 'Sua Empresa');
      setCompanyEmail(config.companyEmail || '');
      setCompanyCNPJ(config.companyCNPJ || '');
      setCompanyAddress(config.companyAddress || '');
      setCompanyPhone(config.companyPhone || '');
      setCompanyLogo(config.companyLogo || null);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const value = {
    companyName,
    setCompanyName,
    companyEmail,
    setCompanyEmail,
    companyCNPJ,
    setCompanyCNPJ,
    companyAddress,
    setCompanyAddress,
    companyPhone,
    setCompanyPhone,
    companyLogo,
    setCompanyLogo,
    saveConfig,
    loadConfig,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
