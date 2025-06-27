
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { getStatusBadge } from './clienteUtils';
import { ActionItem, ActionsDropdown } from '@/components/ui/actions-dropdown';

type SaasClient = Tables<'saas_clients'>;

interface ClientesTableProps {
  clients: SaasClient[];
  onEditClient: (client: SaasClient) => void;
  onToggleStatus: (client: SaasClient) => void;
}

export function ClientesTable({ clients, onEditClient, onToggleStatus }: ClientesTableProps) {
  const getActionsForClient = (client: SaasClient): ActionItem[] => [
    {
      type: 'edit',
      label: 'Editar',
      onClick: () => onEditClient(client),
    },
    {
      type: client.status === 'active' ? 'block' : 'activate',
      label: client.status === 'active' ? 'Bloquear' : 'Ativar',
      onClick: () => onToggleStatus(client),
      variant: client.status === 'active' ? 'destructive' : 'success',
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Lista de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.company_name}</TableCell>
                <TableCell>{client.contact_name}</TableCell>
                <TableCell>{client.contact_email}</TableCell>
                <TableCell>{getStatusBadge(client.status)}</TableCell>
                <TableCell>{format(new Date(client.created_at), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="text-right">
                  <ActionsDropdown actions={getActionsForClient(client)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
