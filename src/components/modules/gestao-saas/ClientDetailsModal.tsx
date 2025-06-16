
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  Users,
  Settings,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type SaasClient = Tables<'saas_clients'>;
type SaasSubscription = Tables<'saas_subscriptions'>;
type ClientOnboarding = Tables<'client_onboarding'>;
type ClientConfiguration = Tables<'saas_client_configurations'>;

interface ClientWithDetails extends SaasClient {
  subscription?: SaasSubscription;
  onboarding?: ClientOnboarding;
  userCount?: number;
}

interface ClientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithDetails;
  onUpdate: () => void;
}

export function ClientDetailsModal({ isOpen, onClose, client, onUpdate }: ClientDetailsModalProps) {
  const [configurations, setConfigurations] = useState<ClientConfiguration[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && client) {
      fetchClientConfigurations();
    }
  }, [isOpen, client]);

  const fetchClientConfigurations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saas_client_configurations')
        .select('*')
        .eq('client_id', client.id)
        .order('configuration_key');

      if (error) throw error;
      setConfigurations(data || []);
    } catch (error) {
      console.error('Error fetching configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = client.status === 'active' ? 'blocked' : 'active';
    
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'blocked') {
        updateData.blocked_at = new Date().toISOString();
        updateData.blocked_reason = 'Bloqueado pelo super admin';
      } else {
        updateData.blocked_at = null;
        updateData.blocked_reason = null;
      }

      const { error } = await supabase
        .from('saas_clients')
        .update(updateData)
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: 'Status Atualizado',
        description: `Cliente ${newStatus === 'active' ? 'ativado' : 'bloqueado'} com sucesso.`,
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating client status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do cliente.',
        variant: 'destructive',
      });
    }
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const, color: 'text-green-600' },
      trial: { label: 'Trial', variant: 'secondary' as const, color: 'text-yellow-600' },
      blocked: { label: 'Bloqueado', variant: 'destructive' as const, color: 'text-red-600' },
      suspended: { label: 'Suspenso', variant: 'outline' as const, color: 'text-gray-600' }
    };

    return statusConfig[status as keyof typeof statusConfig] || 
           { label: status, variant: 'outline' as const, color: 'text-gray-600' };
  };

  const statusInfo = getStatusInfo(client.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Detalhes do Cliente: {client.company_name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{client.company_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.contact_email}</span>
                </div>
                
                {client.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{client.contact_phone}</span>
                  </div>
                )}
                
                {client.cnpj && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">CNPJ:</span>
                    <span className="text-sm">{client.cnpj}</span>
                  </div>
                )}
                
                {(client.address || client.city || client.state) && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {client.address && <div>{client.address}</div>}
                      {(client.city || client.state) && (
                        <div>{client.city}{client.city && client.state && ', '}{client.state}</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Criado em {new Date(client.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assinatura */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Assinatura
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.subscription ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge>{client.subscription.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Preço Mensal:</span>
                    <span>R$ {client.subscription.monthly_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {client.subscription.yearly_price && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Preço Anual:</span>
                      <span>R$ {client.subscription.yearly_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Ciclo:</span>
                    <span className="capitalize">{client.subscription.billing_cycle}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Início:</span>
                    <span>{new Date(client.subscription.start_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {client.subscription.trial_end_date && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Fim do Trial:</span>
                      <span>{new Date(client.subscription.trial_end_date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma assinatura ativa</p>
              )}
            </CardContent>
          </Card>

          {/* Onboarding */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Status do Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.onboarding ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Setup Concluído:</span>
                    <Badge variant={client.onboarding.setup_completed ? 'default' : 'secondary'}>
                      {client.onboarding.setup_completed ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Admin Criado:</span>
                    <Badge variant={client.onboarding.admin_user_created ? 'default' : 'secondary'}>
                      {client.onboarding.admin_user_created ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dados Iniciais:</span>
                    <Badge variant={client.onboarding.initial_data_created ? 'default' : 'secondary'}>
                      {client.onboarding.initial_data_created ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Email de Boas-vindas:</span>
                    <Badge variant={client.onboarding.welcome_email_sent ? 'default' : 'secondary'}>
                      {client.onboarding.welcome_email_sent ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                  {client.onboarding.onboarding_completed_at && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Concluído em {new Date(client.onboarding.onboarding_completed_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Onboarding não iniciado</p>
              )}
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Carregando configurações...</p>
              ) : configurations.length > 0 ? (
                <div className="space-y-3">
                  {configurations.map((config) => (
                    <div key={config.id} className="border rounded p-3">
                      <div className="font-medium text-sm">{config.configuration_key}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {typeof config.configuration_value === 'object' 
                          ? JSON.stringify(config.configuration_value, null, 2)
                          : String(config.configuration_value)
                        }
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma configuração encontrada</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant={client.status === 'active' ? 'destructive' : 'default'}
              onClick={handleToggleStatus}
            >
              {client.status === 'active' ? 'Bloquear Cliente' : 'Ativar Cliente'}
            </Button>
          </div>
          
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
