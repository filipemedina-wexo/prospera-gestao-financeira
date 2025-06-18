
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Proposta } from "./types";
import { Eye } from "lucide-react";
import { ActionExpandableTabs, ActionItem } from "@/components/ui/action-expandable-tabs";

interface PropostasListProps {
  propostas: Proposta[];
  onStatusChange: (propostaId: string, newStatus: Proposta['status']) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    rascunho: { variant: "secondary" as const, label: "Rascunho" },
    enviada: { variant: "outline" as const, label: "Enviada" },
    aceita: { variant: "default" as const, label: "Aceita" },
    recusada: { variant: "destructive" as const, label: "Recusada" },
    perdida: { variant: "destructive" as const, label: "Perdida" },
    negociacao: { variant: "outline" as const, label: "Em Negociação" }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export function PropostasList({ propostas, onStatusChange }: PropostasListProps) {
  const getActionsForProposta = (proposta: Proposta): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        type: 'view',
        label: 'Ver detalhes',
        onClick: () => console.log('Ver proposta', proposta.id),
      }
    ];

    if (proposta.status !== 'aceita' && proposta.status !== 'recusada' && !proposta.faturada) {
      actions.push({
        type: 'accept',
        label: 'Aceitar',
        onClick: () => onStatusChange(proposta.id, 'aceita'),
        variant: 'success',
      });
    }

    if (proposta.status !== 'aceita' && proposta.status !== 'recusada') {
      actions.push({
        type: 'reject',
        label: 'Recusar',
        onClick: () => onStatusChange(proposta.id, 'recusada'),
        variant: 'destructive',
      });
    }

    actions.push({
      type: 'edit',
      label: 'Editar',
      onClick: () => console.log('Editar proposta', proposta.id),
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
            {propostas.map((proposta) => (
              <TableRow key={proposta.id}>
                <TableCell className="font-medium">{proposta.titulo}</TableCell>
                <TableCell>{proposta.cliente}</TableCell>
                <TableCell>{proposta.vendedor}</TableCell>
                <TableCell className="font-semibold">
                  R$ {proposta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>
                  {format(proposta.dataCriacao, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>{getStatusBadge(proposta.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <span className="sr-only">Ver detalhes</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <ActionExpandableTabs actions={getActionsForProposta(proposta)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
