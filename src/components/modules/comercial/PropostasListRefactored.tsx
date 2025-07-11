import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Proposal } from "@/services/proposalsService";
import { ActionItem, ActionsDropdown } from "@/components/ui/actions-dropdown";
import { Skeleton } from "@/components/ui/skeleton";

interface PropostasListProps {
  propostas: Proposal[];
  onStatusChange: (propostaId: string, newStatus: string) => void;
  onEditProposta: (proposta: Proposal) => void;
  isLoading?: boolean;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { variant: "secondary" as const, label: "Pendente" },
    aceita: { variant: "default" as const, label: "Aceita" },
    rejeitada: { variant: "destructive" as const, label: "Rejeitada" },
    expirada: { variant: "destructive" as const, label: "Expirada" }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export function PropostasListRefactored({ propostas, onStatusChange, onEditProposta, isLoading }: PropostasListProps) {
  const getActionsForProposta = (proposta: Proposal): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        type: 'view',
        label: 'Ver detalhes',
        onClick: () => {},
      }
    ];

    if (proposta.status === 'pending') {
      actions.push({
        type: 'accept',
        label: 'Aceitar',
        onClick: () => onStatusChange(proposta.id, 'aceita'),
        variant: 'success',
      });
      
      actions.push({
        type: 'reject',
        label: 'Rejeitar',
        onClick: () => onStatusChange(proposta.id, 'rejeitada'),
        variant: 'destructive',
      });
    }

    actions.push({
      type: 'edit',
      label: 'Editar',
      onClick: () => onEditProposta(proposta),
    });

    return actions;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Propostas</CardTitle>
        <CardDescription>
          Gerencie todas as suas propostas comerciais
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Criação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {propostas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhuma proposta encontrada
                  </TableCell>
                </TableRow>
              ) : (
                propostas.map((proposta) => (
                  <TableRow key={proposta.id}>
                    <TableCell className="font-medium">{proposta.title}</TableCell>
                    <TableCell>{proposta.client?.company_name || 'Cliente não identificado'}</TableCell>
                    <TableCell>{proposta.seller?.name || 'Vendedor não identificado'}</TableCell>
                    <TableCell className="font-semibold">
                      R$ {proposta.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(proposta.created_at), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(proposta.status)}</TableCell>
                    <TableCell className="text-right">
                      <ActionsDropdown actions={getActionsForProposta(proposta)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}