
import React from 'react';
import { ExpandableTabs } from './expandable-tabs';
import { Eye, Settings, Bell, Home, FileText, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionItem {
  type: 'view' | 'edit' | 'delete' | 'accept' | 'reject' | 'register' | 'block' | 'activate' | 'custom';
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'success';
  customIcon?: React.ComponentType<{ size?: number }>;
}

interface ActionExpandableTabsProps {
  actions: ActionItem[];
  className?: string;
}

const getIconForAction = (type: ActionItem['type'], customIcon?: React.ComponentType<{ size?: number }>) => {
  if (customIcon) return customIcon;
  
  switch (type) {
    case 'view': return Eye;
    case 'edit': return Settings;
    case 'delete': return Bell; // Usando Bell como alerta para ação destrutiva
    case 'accept': return Home;
    case 'reject': return Shield; // Usando Shield como proteção/rejeição
    case 'register': return FileText;
    case 'block': return Shield;
    case 'activate': return Home;
    default: return Settings;
  }
};

export function ActionExpandableTabs({ actions, className }: ActionExpandableTabsProps) {
  const tabs = actions.map((action, index) => ({
    title: action.label,
    icon: getIconForAction(action.type, action.customIcon),
    onClick: action.onClick,
    disabled: action.disabled,
    variant: action.variant,
  }));

  const handleChange = (index: number | null) => {
    if (index !== null && !tabs[index].disabled) {
      tabs[index].onClick();
    }
  };

  return (
    <ExpandableTabs
      tabs={tabs}
      onChange={handleChange}
      className={cn("w-auto min-w-fit", className)}
      activeColor="text-primary"
    />
  );
}
