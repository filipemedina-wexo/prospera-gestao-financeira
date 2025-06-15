
import { useState, useEffect } from 'react';
import { useMultiTenant } from '@/contexts/MultiTenantContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type SaasClient = Tables<'saas_clients'>;

export function ClientSelector() {
  const { currentClientId, isSupperAdmin, assignUserToClient } = useMultiTenant();
  const [clients, setClients] = useState<SaasClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      if (!isSupperAdmin) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('saas_clients')
          .select('*')
          .eq('status', 'active')
          .order('company_name');

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [isSupperAdmin]);

  const handleClientChange = async (clientId: string) => {
    try {
      await assignUserToClient(clientId, 'admin');
    } catch (error) {
      console.error('Error switching client:', error);
    }
  };

  // Only show for super admins
  if (!isSupperAdmin) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Seletor de Cliente
        </CardTitle>
        <CardDescription>
          Como Super Admin, você pode alternar entre diferentes clientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Carregando clientes...</div>
        ) : (
          <Select
            value={currentClientId || ''}
            onValueChange={handleClientChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {currentClientId && (
          <div className="mt-2 text-sm text-muted-foreground">
            Cliente atual: {clients.find(c => c.id === currentClientId)?.company_name}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
