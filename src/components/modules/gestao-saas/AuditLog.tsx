
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  client_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  client_name?: string;
  user_name?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

interface AuditLogProps {
  clientId?: string; // Se fornecido, filtra apenas por cliente
}

export function AuditLog({ clientId }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const { toast } = useToast();

  // Mock data - em produção isso viria do banco de dados
  const mockLogs: AuditLogEntry[] = [
    {
      id: '1',
      client_id: 'client-1',
      user_id: 'user-1',
      action: 'CREATE_ACCOUNT_PAYABLE',
      resource_type: 'accounts_payable',
      resource_id: 'acc-123',
      new_values: { description: 'Conta de luz', amount: 150.00 },
      ip_address: '192.168.1.1',
      created_at: new Date().toISOString(),
      client_name: 'Empresa ABC',
      user_name: 'João Silva',
      severity: 'info'
    },
    {
      id: '2',
      client_id: 'client-1',
      user_id: 'user-2',
      action: 'UPDATE_CLIENT_STATUS',
      resource_type: 'saas_clients',
      resource_id: 'client-1',
      old_values: { status: 'trial' },
      new_values: { status: 'active' },
      ip_address: '192.168.1.2',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      client_name: 'Empresa ABC',
      user_name: 'Admin Sistema',
      severity: 'success'
    },
    {
      id: '3',
      client_id: 'client-2',
      user_id: 'user-3',
      action: 'DELETE_FINANCIAL_CLIENT',
      resource_type: 'financial_clients',
      resource_id: 'fc-456',
      old_values: { name: 'Cliente Teste' },
      ip_address: '192.168.1.3',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      client_name: 'Empresa XYZ',
      user_name: 'Maria Santos',
      severity: 'warning'
    },
    {
      id: '4',
      client_id: 'client-1',
      user_id: 'user-1',
      action: 'LOGIN_FAILED',
      resource_type: 'auth',
      ip_address: '192.168.1.1',
      created_at: new Date(Date.now() - 10800000).toISOString(),
      client_name: 'Empresa ABC',
      user_name: 'João Silva',
      severity: 'error'
    }
  ];

  useEffect(() => {
    fetchAuditLogs();
  }, [clientId]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      // Por enquanto usando dados mock
      // Em produção, implementar query real ao banco
      let filteredLogs = mockLogs;
      
      if (clientId) {
        filteredLogs = mockLogs.filter(log => log.client_id === clientId);
      }
      
      setLogs(filteredLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar logs de auditoria.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const config = {
      success: { label: 'Sucesso', variant: 'default' as const },
      warning: { label: 'Atenção', variant: 'secondary' as const },
      error: { label: 'Erro', variant: 'destructive' as const },
      info: { label: 'Info', variant: 'outline' as const }
    };

    const { label, variant } = config[severity as keyof typeof config] || config.info;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getActionDescription = (action: string) => {
    const descriptions: Record<string, string> = {
      'CREATE_ACCOUNT_PAYABLE': 'Criou conta a pagar',
      'UPDATE_CLIENT_STATUS': 'Alterou status do cliente',
      'DELETE_FINANCIAL_CLIENT': 'Excluiu cliente financeiro',
      'LOGIN_FAILED': 'Falha no login',
      'CREATE_USER': 'Criou usuário',
      'UPDATE_SUBSCRIPTION': 'Atualizou assinatura',
      'EXPORT_DATA': 'Exportou dados'
    };

    return descriptions[action] || action;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Log de Auditoria</h3>
          <p className="text-sm text-muted-foreground">
            {clientId ? 'Ações específicas do cliente' : 'Todas as ações do sistema'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ação, usuário ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedSeverity === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('all')}
              >
                Todos
              </Button>
              <Button
                variant={selectedSeverity === 'info' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('info')}
              >
                Info
              </Button>
              <Button
                variant={selectedSeverity === 'success' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('success')}
              >
                Sucesso
              </Button>
              <Button
                variant={selectedSeverity === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('warning')}
              >
                Atenção
              </Button>
              <Button
                variant={selectedSeverity === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSeverity('error')}
              >
                Erro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando logs...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum log encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(log.severity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{getActionDescription(log.action)}</h4>
                        {getSeverityBadge(log.severity)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{log.user_name}</span>
                        </span>
                        {!clientId && (
                          <span className="flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span>{log.client_name}</span>
                          </span>
                        )}
                        {log.ip_address && (
                          <span className="text-xs">IP: {log.ip_address}</span>
                        )}
                      </div>
                      
                      {(log.old_values || log.new_values) && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          {log.old_values && (
                            <div>
                              <span className="font-medium">Valores antigos:</span> {JSON.stringify(log.old_values)}
                            </div>
                          )}
                          {log.new_values && (
                            <div>
                              <span className="font-medium">Valores novos:</span> {JSON.stringify(log.new_values)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
