
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Building, 
  CreditCard, 
  Activity,
  Plus,
  Eye,
  Settings,
  BarChart3,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { ClientOnboardingWizard } from './ClientOnboardingWizard';

type SaasClient = Tables<'saas_clients'>;
type SaasSubscription = Tables<'saas_subscriptions'>;
type ClientOnboarding = Tables<'client_onboarding'>;

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  trialClients: number;
  totalRevenue: number;
  pendingOnboardings: number;
}

interface ClientWithDetails extends SaasClient {
  subscription?: SaasSubscription;
  onboarding?: ClientOnboarding;
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    trialClients: 0,
    totalRevenue: 0,
    pendingOnboardings: 0
  });
  
  const [clients, setClients] = useState<ClientWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('saas_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Buscar assinaturas
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('saas_subscriptions')
        .select('*');

      if (subscriptionsError) throw subscriptionsError;

      // Buscar dados de onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('client_onboarding')
        .select('*');

      if (onboardingError) throw onboardingError;

      // Combinar dados
      const clientsWithDetails = clientsData?.map(client => ({
        ...client,
        subscription: subscriptionsData?.find(sub => sub.client_id === client.id),
        onboarding: onboardingData?.find(ob => ob.client_id === client.id)
      })) || [];

      setClients(clientsWithDetails);

      // Calcular estatísticas
      const totalClients = clientsData?.length || 0;
      const activeClients = clientsData?.filter(c => c.status === 'active').length || 0;
      const trialClients = clientsData?.filter(c => c.status === 'trial').length || 0;
      const pendingOnboardings = onboardingData?.filter(o => !o.onboarding_completed_at).length || 0;
      
      const totalRevenue = subscriptionsData?.reduce((sum, sub) => 
        sum + (sub.billing_cycle === 'yearly' ? sub.yearly_price || 0 : sub.monthly_price || 0), 0
      ) || 0;

      setStats({
        totalClients,
        activeClients,
        trialClients,
        totalRevenue,
        pendingOnboardings
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do dashboard.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const getOnboardingProgress = (onboarding?: ClientOnboarding) => {
    if (!onboarding) return 0;
    
    const steps = [
      onboarding.setup_completed,
      onboarding.admin_user_created,
      onboarding.initial_data_created,
      onboarding.welcome_email_sent
    ];
    
    const completedSteps = steps.filter(Boolean).length;
    return (completedSteps / steps.length) * 100;
  };

  const handleOnboardingComplete = (clientId: string) => {
    setShowOnboardingWizard(false);
    fetchDashboardData();
    toast({
      title: 'Onboarding Concluído',
      description: 'Cliente configurado com sucesso!',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Super Admin</h2>
          <p className="text-muted-foreground">
            Gerencie clientes SaaS e monitore o sistema
          </p>
        </div>
        <Button onClick={() => setShowOnboardingWizard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Trial</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.trialClients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboardings Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingOnboardings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clients.slice(0, 10).map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h4 className="font-semibold">{client.company_name}</h4>
                    <p className="text-sm text-muted-foreground">{client.contact_email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {client.onboarding && !client.onboarding.onboarding_completed_at && (
                    <div className="flex items-center space-x-2">
                      <div className="w-24">
                        <Progress value={getOnboardingProgress(client.onboarding)} className="h-2" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(getOnboardingProgress(client.onboarding))}%
                      </span>
                    </div>
                  )}
                  
                  {getStatusBadge(client.status)}
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Wizard de Onboarding */}
      <ClientOnboardingWizard
        isOpen={showOnboardingWizard}
        onClose={() => setShowOnboardingWizard(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
