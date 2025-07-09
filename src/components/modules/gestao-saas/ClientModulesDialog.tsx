import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  Wallet, 
  Users, 
  TrendingUp, 
  Package, 
  Truck, 
  FileText, 
  BarChart3,
  UsersIcon,
  Settings
} from 'lucide-react';

type SaasClient = Tables<'saas_clients'>;
type ClientModule = Tables<'client_modules'>;

interface ClientModulesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: SaasClient;
  onUpdate: () => void;
}

interface ModuleConfig {
  name: string;
  label: string;
  description: string;
  icon: any;
  category: string;
}

const AVAILABLE_MODULES: ModuleConfig[] = [
  {
    name: 'dashboard',
    label: 'Dashboard',
    description: 'Visão geral do sistema',
    icon: LayoutDashboard,
    category: 'Principal'
  },
  {
    name: 'contas-pagar',
    label: 'Contas a Pagar',
    description: 'Gerenciamento de contas a pagar',
    icon: CreditCard,
    category: 'Financeiro'
  },
  {
    name: 'contas-receber',
    label: 'Contas a Receber',
    description: 'Gerenciamento de contas a receber',
    icon: Receipt,
    category: 'Financeiro'
  },
  {
    name: 'caixa',
    label: 'Caixa',
    description: 'Controle de caixa e movimentações',
    icon: Wallet,
    category: 'Financeiro'
  },
  {
    name: 'crm',
    label: 'CRM',
    description: 'Gestão de relacionamento com clientes',
    icon: Users,
    category: 'Comercial'
  },
  {
    name: 'comercial',
    label: 'Comercial',
    description: 'Propostas e vendas',
    icon: TrendingUp,
    category: 'Comercial'
  },
  {
    name: 'produtos-servicos',
    label: 'Produtos & Serviços',
    description: 'Cadastro de produtos e serviços',
    icon: Package,
    category: 'Cadastros'
  },
  {
    name: 'fornecedores',
    label: 'Fornecedores',
    description: 'Cadastro de fornecedores',
    icon: Truck,
    category: 'Cadastros'
  },
  {
    name: 'relatorios',
    label: 'Relatórios',
    description: 'Relatórios e análises',
    icon: FileText,
    category: 'Relatórios'
  },
  {
    name: 'dre',
    label: 'DRE',
    description: 'Demonstração do Resultado do Exercício',
    icon: BarChart3,
    category: 'Relatórios'
  },
  {
    name: 'pessoas',
    label: 'Pessoas',
    description: 'Gestão de recursos humanos',
    icon: UsersIcon,
    category: 'RH'
  },
  {
    name: 'configuracoes',
    label: 'Configurações',
    description: 'Configurações do sistema',
    icon: Settings,
    category: 'Sistema'
  }
];

export function ClientModulesDialog({ isOpen, onClose, client, onUpdate }: ClientModulesDialogProps) {
  const [modules, setModules] = useState<ClientModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && client) {
      fetchClientModules();
    }
  }, [isOpen, client]);

  const fetchClientModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_modules')
        .select('*')
        .eq('client_id', client.id)
        .order('module_name');

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error fetching client modules:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar módulos do cliente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = async (moduleName: string, isEnabled: boolean) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('client_modules')
        .upsert({
          client_id: client.id,
          module_name: moduleName,
          is_enabled: isEnabled
        }, {
          onConflict: 'client_id,module_name'
        });

      if (error) throw error;

      // Atualizar estado local
      setModules(prev => {
        const existing = prev.find(m => m.module_name === moduleName);
        if (existing) {
          return prev.map(m => 
            m.module_name === moduleName 
              ? { ...m, is_enabled: isEnabled }
              : m
          );
        } else {
          return [...prev, {
            id: `temp-${Date.now()}`,
            client_id: client.id,
            module_name: moduleName,
            is_enabled: isEnabled,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }];
        }
      });

      toast({
        title: 'Módulo atualizado',
        description: `Módulo ${isEnabled ? 'habilitado' : 'desabilitado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error updating module:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar módulo.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getModuleStatus = (moduleName: string) => {
    const module = modules.find(m => m.module_name === moduleName);
    return module?.is_enabled ?? true; // Default to enabled if not found
  };

  const groupedModules = AVAILABLE_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleConfig[]>);

  const enabledCount = AVAILABLE_MODULES.filter(m => getModuleStatus(m.name)).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Módulos - {client.company_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Configure quais módulos estão disponíveis para este cliente
              </p>
            </div>
            <Badge variant="secondary">
              {enabledCount} de {AVAILABLE_MODULES.length} módulos habilitados
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Carregando módulos...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedModules).map(([category, categoryModules]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryModules.map((module) => {
                        const Icon = module.icon;
                        const isEnabled = getModuleStatus(module.name);
                        
                        return (
                          <div key={module.name} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={module.name} className="text-sm font-medium">
                                  {module.label}
                                </Label>
                                <Switch
                                  id={module.name}
                                  checked={isEnabled}
                                  onCheckedChange={(checked) => handleModuleToggle(module.name, checked)}
                                  disabled={saving}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {module.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose} disabled={saving}>
            {saving ? 'Salvando...' : 'Fechar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}