
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityAuditEntry {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export function SecurityAuditView() {
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSuccess, setFilterSuccess] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs');
      toast({
        title: 'Erro',
        description: 'Erro ao carregar logs de auditoria.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string, success: boolean) => {
    const color = success ? 'default' : 'destructive';
    return <Badge variant={color}>{action}</Badge>;
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSuccess = filterSuccess === 'all' || 
      (filterSuccess === 'success' && log.success) ||
      (filterSuccess === 'failure' && !log.success);
    
    return matchesSearch && matchesSuccess;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Auditoria de Segurança
          </h3>
          <p className="text-sm text-muted-foreground">
            Monitoramento de eventos de segurança do sistema
          </p>
        </div>
        <Button onClick={fetchAuditLogs} variant="outline">
          Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ação ou tipo de recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterSuccess === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSuccess('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterSuccess === 'success' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSuccess('success')}
              >
                Sucessos
              </Button>
              <Button
                variant={filterSuccess === 'failure' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterSuccess('failure')}
              >
                Falhas
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
              <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum log de auditoria encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getSuccessIcon(log.success)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getActionBadge(log.action, log.success)}
                        <span className="text-sm text-muted-foreground">
                          {log.resource_type}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      {log.user_id && (
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>Usuário: {log.user_id}</span>
                        </div>
                      )}
                      
                      {log.resource_id && (
                        <div className="text-xs">
                          Recurso ID: {log.resource_id}
                        </div>
                      )}
                      
                      {log.error_message && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                          <span className="font-medium">Erro:</span> {log.error_message}
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
