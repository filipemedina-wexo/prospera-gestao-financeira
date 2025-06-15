
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  CreditCard, 
  TrendingUp,
  UserCheck,
  UserX,
  Timer,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SaasMetrics {
  totalClients: number;
  activeClients: number;
  trialClients: number;
  blockedClients: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  completedOnboarding: number;
  pendingOnboarding: number;
}

export function SaasMetrics() {
  const [metrics, setMetrics] = useState<SaasMetrics>({
    totalClients: 0,
    activeClients: 0,
    trialClients: 0,
    blockedClients: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    completedOnboarding: 0,
    pendingOnboarding: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Métricas de clientes
      const { data: clients, error: clientsError } = await supabase
        .from('saas_clients')
        .select('status');

      if (clientsError) throw clientsError;

      // Métricas de assinaturas
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('saas_subscriptions')
        .select('status, monthly_price');

      if (subscriptionsError) throw subscriptionsError;

      // Métricas de onboarding
      const { data: onboarding, error: onboardingError } = await supabase
        .from('client_onboarding')
        .select('onboarding_completed_at');

      if (onboardingError) throw onboardingError;

      // Calcular métricas de clientes
      const totalClients = clients?.length || 0;
      const activeClients = clients?.filter(c => c.status === 'active').length || 0;
      const trialClients = clients?.filter(c => c.status === 'trial').length || 0;
      const blockedClients = clients?.filter(c => c.status === 'blocked').length || 0;

      // Calcular métricas de assinaturas
      const totalSubscriptions = subscriptions?.length || 0;
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
      const monthlyRevenue = subscriptions
        ?.filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (s.monthly_price || 0), 0) || 0;

      // Calcular métricas de onboarding
      const completedOnboarding = onboarding?.filter(o => o.onboarding_completed_at).length || 0;
      const pendingOnboarding = (onboarding?.length || 0) - completedOnboarding;

      setMetrics({
        totalClients,
        activeClients,
        trialClients,
        blockedClients,
        totalSubscriptions,
        activeSubscriptions,
        monthlyRevenue,
        completedOnboarding,
        pendingOnboarding,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar métricas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const metricCards = [
    {
      title: 'Total de Clientes',
      value: metrics.totalClients,
      icon: Building2,
      description: 'Clientes cadastrados',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Clientes Ativos',
      value: metrics.activeClients,
      icon: UserCheck,
      description: 'Com assinatura ativa',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Clientes Trial',
      value: metrics.trialClients,
      icon: Timer,
      description: 'Em período de teste',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      title: 'Clientes Bloqueados',
      value: metrics.blockedClients,
      icon: UserX,
      description: 'Acesso suspenso',
      color: 'bg-red-100 text-red-800'
    },
    {
      title: 'Assinaturas Ativas',
      value: metrics.activeSubscriptions,
      icon: CreditCard,
      description: `de ${metrics.totalSubscriptions} total`,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${metrics.monthlyRevenue.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Receita recorrente',
      color: 'bg-emerald-100 text-emerald-800'
    },
    {
      title: 'Onboarding Completo',
      value: metrics.completedOnboarding,
      icon: CheckCircle,
      description: `${metrics.pendingOnboarding} pendentes`,
      color: 'bg-cyan-100 text-cyan-800'
    },
    {
      title: 'Total Usuários',
      value: '---',
      icon: Users,
      description: 'Em desenvolvimento',
      color: 'bg-gray-100 text-gray-800'
    }
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold">
                  {metric.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
              <div className={`p-3 rounded-full ${metric.color}`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
