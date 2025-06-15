
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ClienteSaaSDialog } from './ClienteSaaSDialog';
import { Tables } from '@/integrations/supabase/types';
import { ClientesHeader } from './ClientesHeader';
import { ClientesTable } from './ClientesTable';

type SaasClient = Tables<'saas_clients'>;

export function ClientesManagement() {
  const [clients, setClients] = useState<SaasClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SaasClient | null>(null);
  const { toast } = useToast();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saas_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar clientes SaaS.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = () => {
    setSelectedClient(null);
    setIsDialogOpen(true);
  };

  const handleEditClient = (client: SaasClient) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleToggleStatus = async (client: SaasClient) => {
    const newStatus = client.status === 'active' ? 'blocked' : 'active';
    
    try {
      const { error } = await supabase
        .from('saas_clients')
        .update({ status: newStatus })
        .eq('id', client.id);

      if (error) throw error;

      toast({
        title: 'Status Atualizado',
        description: `Cliente ${newStatus === 'active' ? 'ativado' : 'bloqueado'} com sucesso.`,
      });

      fetchClients();
    } catch (error) {
      console.error('Error updating client status:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do cliente.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando clientes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ClientesHeader onAddClient={handleAddClient} />

      <ClientesTable 
        clients={clients}
        onEditClient={handleEditClient}
        onToggleStatus={handleToggleStatus}
      />

      <ClienteSaaSDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        client={selectedClient}
        onSave={fetchClients}
      />
    </div>
  );
}
