
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClientOnboardingCard } from './ClientOnboardingCard';
import { Tables } from '@/integrations/supabase/types';

type SaasClient = Tables<'saas_clients'>;
type ClientOnboarding = Tables<'client_onboarding'>;

interface ClientWithOnboarding extends SaasClient {
  onboarding?: ClientOnboarding | null;
}

export function OnboardingManagement() {
  const [clients, setClients] = useState<ClientWithOnboarding[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchClientsWithOnboarding = async () => {
    try {
      setLoading(true);
      
      // Buscar todos os clientes
      const { data: clientsData, error: clientsError } = await supabase
        .from('saas_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Buscar dados de onboarding
      const { data: onboardingData, error: onboardingError } = await supabase
        .from('client_onboarding')
        .select('*');

      if (onboardingError) throw onboardingError;

      // Combinar os dados
      const clientsWithOnboarding = clientsData?.map(client => ({
        ...client,
        onboarding: onboardingData?.find(ob => ob.client_id === client.id) || null
      })) || [];

      setClients(clientsWithOnboarding);
    } catch (error) {
      console.error('Error fetching clients with onboarding:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados de onboarding.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsWithOnboarding();
  }, []);

  const filteredClients = clients.filter(client =>
    client.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Onboarding de Clientes</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie o processo de onboarding dos clientes SaaS
          </p>
        </div>
        <Button onClick={fetchClientsWithOnboarding} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa ou contato..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando clientes...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.map((client) => (
                <ClientOnboardingCard
                  key={client.id}
                  client={client}
                  onboardingData={client.onboarding}
                  onRefresh={fetchClientsWithOnboarding}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
