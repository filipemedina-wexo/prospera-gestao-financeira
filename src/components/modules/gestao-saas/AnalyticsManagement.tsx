
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SaasMetrics } from './SaasMetrics';

interface AnalyticsData {
  month: string;
  newClients: number;
  revenue: number;
  activeSubscriptions: number;
}

export function AnalyticsManagement() {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const { toast } = useToast();

  // Dados mockados para demonstração
  const mockData: AnalyticsData[] = [
    { month: 'Jan', newClients: 5, revenue: 2500, activeSubscriptions: 15 },
    { month: 'Fev', newClients: 8, revenue: 4200, activeSubscriptions: 23 },
    { month: 'Mar', newClients: 12, revenue: 6800, activeSubscriptions: 35 },
    { month: 'Abr', newClients: 7, revenue: 5400, activeSubscriptions: 42 },
    { month: 'Mai', newClients: 15, revenue: 8900, activeSubscriptions: 57 },
    { month: 'Jun', newClients: 10, revenue: 7200, activeSubscriptions: 67 },
  ];

  useEffect(() => {
    // Por enquanto usando dados mockados
    setAnalyticsData(mockData);
  }, []);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Relatório Gerado',
        description: 'Relatório de analytics foi gerado com sucesso.',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar relatório.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics SaaS</h3>
          <p className="text-sm text-muted-foreground">
            Visualize métricas e tendências do negócio SaaS
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateReport} disabled={loading}>
            <Download className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Gerar Relatório
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <SaasMetrics />

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Novos Clientes por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="newClients" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Receita Mensal (R$)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assinaturas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="activeSubscriptions" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Indicadores adicionais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">94%</div>
            <div className="text-sm text-muted-foreground">Taxa de Retenção</div>
            <Badge variant="outline" className="mt-2 bg-green-100 text-green-800">
              +2% vs mês anterior
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">R$ 189</div>
            <div className="text-sm text-muted-foreground">Ticket Médio</div>
            <Badge variant="outline" className="mt-2 bg-blue-100 text-blue-800">
              +15% vs mês anterior
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">23 dias</div>
            <div className="text-sm text-muted-foreground">Tempo Médio de Onboarding</div>
            <Badge variant="outline" className="mt-2 bg-purple-100 text-purple-800">
              -5 dias vs mês anterior
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
