
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Building,
  User,
  CreditCard,
  Activity,
  Settings,
  Users,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { AuditLog } from './AuditLog';
import { ClientOnboardingCard } from './ClientOnboardingCard';

type SaasClient = Tables<'saas_clients'>;
type SaasSubscription = Tables<'saas_subscriptions'>;
type ClientOnboarding = Tables<'client_onboarding'>;

interface ClientDetailsViewProps {
  clientId: string;
  onBack: () => void;
}

interface ClientStats {
  totalUsers: number;
  accountsPayable: number;
  accountsReceivable: number;
  totalFinancialClients: number;
}

export function ClientDetailsView({ clientId, onBack }: ClientDetailsViewProps) {
  const [client, setClient] = useState<SaasClient | null>(null);
  const [subscription, setSubscription] = useState<SaasSubscription | null>(null);
  const [onboarding, setOnboarding] = useState<ClientOnboarding | null>(null);
  const [stats, setStats] = useState<ClientStats>({
    totalUsers: 0,
    accountsPayable: 0,
    accountsReceivable: 0,
    totalFinancialClients: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClientDetails();
  }, [clientId]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);

      // Buscar dados do cliente
      const { data: clientData, error: clientError } = await supabase
        .from('saas_clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      setClient(clientData);

      // Buscar assinatura
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('saas_subscriptions')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (subscriptionError) throw subscriptionError;
      setSubscription(subscriptionData);

      // Buscar onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('client_onboarding')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (onboardingError) throw onboardingError;
      setOnboarding(onboardingData);

      // Buscar estatísticas (simuladas por enquanto)
      setStats({
        totalUsers: 5,
        accountsPayable: 15,
        accountsReceivable: 12,
        totalFinancialClients: 25
      });

    } catch (error) {
      console.error('Error fetching client details:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar detalhes do cliente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const },
      trial: { label: 'Trial', variant: 'secondary' as const },
      blocked: { label: 'Bloqueado', variant: 'destructive' as const },
      suspended: { label: 'Suspenso', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, variant: 'outline' as const };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cliente não encontrado.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{client.company_name}</h2>
            <p className="text-muted-foreground">{client.contact_email}</p>
          </div>
          {getStatusBadge(client.status)}
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Pagar</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accountsPayable}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas a Receber</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accountsReceivable}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Financeiros</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFinancialClients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome da Empresa</label>
                  <p className="text-sm">{client.company_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contato</label>
                  <p className="text-sm">{client.contact_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{client.contact_email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-sm">{client.contact_phone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
                  <p className="text-sm">{client.cnpj || 'Não informado'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <p className="text-sm">{subscription.status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ciclo de Cobrança</label>
                      <p className="text-sm">{subscription.billing_cycle}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Valor Mensal</label>
                      <p className="text-sm">R$ {subscription.monthly_price.toFixed(2)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma assinatura ativa</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="onboarding">
          {onboarding ? (
            <ClientOnboardingCard
              client={client}
              onboardingData={onboarding}
              onRefresh={fetchClientDetails}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Onboarding não iniciado para este cliente.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Usuários do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lista de usuários será implementada aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <AuditLog clientId={clientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
