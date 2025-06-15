
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
import { MoreHorizontal, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { Tables } from '@/integrations/supabase/types';
import { getStatusBadge } from './clienteUtils';

type SaasClient = Tables<'saas_clients'>;

interface ClientesTableProps {
  clients: SaasClient[];
  onEditClient: (client: SaasClient) => void;
  onToggleStatus: (client: SaasClient) => void;
}

export function ClientesTable({ clients, onEditClient, onToggleStatus }: ClientesTableProps) {
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditClient(client)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(client)}>
                        {client.status === 'active' ? 'Bloquear' : 'Ativar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
