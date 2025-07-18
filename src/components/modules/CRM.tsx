
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClientList } from "./crm/ClientList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Client } from "./crm/types";
import { ClientDashboard } from "./crm/ClientDashboard";
import { Segmentation } from "./crm/Segmentation";
import { clientsService, Client as DatabaseClient } from "@/services/clientsService";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useEffect } from "react";

interface CRMProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const CRM = ({ clients: legacyClients, setClients: setLegacyClients }: CRMProps) => {
  // Migrate data on component mount
  useEffect(() => {
    const migrateData = async () => {
      try {
        await clientsService.migrateFromFinancialClients();
      } catch (error) {
        console.error('Erro na migração:', error);
      }
    };
    migrateData();
  }, []);

  // Load real clients from database (customers and both)
  const { data: databaseClients = [], isLoading } = useQuery({
    queryKey: ['crm_clients'],
    queryFn: async () => {
      const [customers, both] = await Promise.all([
        clientsService.getAllCustomers(),
        clientsService.getAll()
      ]);
      // Filter to get only customers and both types
      return both.filter(client => 
        client.client_type === 'customer' || client.client_type === 'both'
      );
    }
  });

  // Transform database clients to match Client interface
  const clients = useMemo((): Client[] => {
    return databaseClients.map((dc: DatabaseClient) => ({
      id: dc.id,
      name: dc.company_name,
      email: dc.contact_email,
      phone: dc.contact_phone,
      document: dc.document_number,
      address: dc.address,
      city: dc.city,
      state: dc.state,
      cep: dc.zip_code,
      saas_client_id: dc.saas_client_id,
      created_at: dc.created_at,
      updated_at: dc.updated_at,
      // Computed fields for compatibility
      razaoSocial: dc.company_name,
      nomeFantasia: dc.trade_name || dc.company_name,
      cnpj: dc.document_number || '',
      endereco: dc.address || '',
      cidade: dc.city || '',
      estado: dc.state || '',
      nomeContato: dc.contact_name || '',
      telefone: dc.contact_phone || '',
      whatsapp: dc.whatsapp || dc.contact_phone || '',
      status: dc.is_active ? 'Ativo' as const : 'Inativo' as const,
      dataCadastro: new Date(dc.created_at),
      origem: 'Sistema',
      observacoes: dc.notes || '',
      dataAniversario: dc.anniversary_date ? new Date(dc.anniversary_date) : undefined,
      historicoCompras: [],
      valorTotalCompras: 0,
      dataUltimaCompra: undefined,
      frequenciaCompra: 'Ocasional' as const,
      company: dc.company_name,
      lastContact: new Date(),
      value: 0,
      tags: [],
      notes: dc.notes || '',
      source: 'Sistema',
      assignedTo: 'Sistema',
      createdAt: new Date(dc.created_at),
      segment: dc.client_type === 'both' ? 'premium' : 'standard' as const,
      industry: 'Geral',
      size: 'média' as const,
      location: dc.city && dc.state ? `${dc.city}, ${dc.state}` : '',
      website: dc.website || '',
      socialMedia: {}
    }));
  }, [databaseClients]);

  const setClients = (updater: React.SetStateAction<Client[]>) => {
    // For compatibility, but actual updates should go through the service
    if (typeof updater === 'function') {
      const newClients = updater(clients);
      console.log('CRM client update attempted:', newClients);
    }
  };

  return (
  <div>
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>CRM - Gestão do Relacionamento</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Tenha uma visão 360º dos seus clientes e fornecedores, otimize relacionamentos, controle oportunidades e impulsione campanhas, tudo em um só lugar.
        </p>
      </CardContent>
    </Card>
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="clients">Clientes</TabsTrigger>
        <TabsTrigger value="segmentation">Segmentação</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard"><ClientDashboard clients={clients} /></TabsContent>
      <TabsContent value="clients"><ClientList clients={clients} setClients={setClients} /></TabsContent>
      <TabsContent value="segmentation"><Segmentation clients={clients} /></TabsContent>
    </Tabs>
  </div>
  );
};

export { CRM };
