
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
  XCircle,
  Building
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  success: boolean;
  error_message?: string | null;
  metadata?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

interface AuditLogProps {
  clientId?: string; // Se fornecido, filtra apenas por cliente
}

export function AuditLog({ clientId }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();


  useEffect(() => {
    fetchAuditLogs();
  }, [clientId]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      const { data, error } = await query;
      if (error) throw error;
      setLogs((data || []).map(log => ({
        ...log,
        ip_address: log.ip_address as string | null,
        user_agent: log.user_agent as string | null,
        resource_id: log.resource_id as string | null,
        error_message: log.error_message as string | null,
        user_id: log.user_id as string | null
      })));
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

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (success: boolean) => {
    if (success) {
      return <Badge variant="default">Sucesso</Badge>;
    } else {
      return <Badge variant="destructive">Erro</Badge>;
    }
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
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'success' && log.success) ||
      (selectedStatus === 'error' && !log.success);
    
    return matchesSearch && matchesStatus;
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
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={selectedStatus === 'success' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('success')}
              >
                Sucesso
              </Button>
              <Button
                variant={selectedStatus === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('error')}
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
                    {getStatusIcon(log.success)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{getActionDescription(log.action)}</h4>
                        {getStatusBadge(log.success)}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Usuário: {log.user_id}</span>
                        </span>
                        <span>Recurso: {log.resource_type}</span>
                        {log.ip_address && (
                          <span className="text-xs">IP: {log.ip_address}</span>
                        )}
                      </div>
                      
                      {log.error_message && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                          <span className="font-medium">Erro:</span> {log.error_message}
                        </div>
                      )}
                      
                      {log.metadata && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <span className="font-medium">Metadados:</span> {JSON.stringify(log.metadata)}
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
