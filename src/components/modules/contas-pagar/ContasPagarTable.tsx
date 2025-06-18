
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ContaPagar } from "./types";
import { currencyFormatter } from "./config";
import { cn } from "@/lib/utils";
import { ActionExpandableTabs, ActionItem } from "@/components/ui/action-expandable-tabs";

interface ContasPagarTableProps {
  contas: ContaPagar[];
  onAbrirDialogPagamento: (contaId: string) => void;
  onEdit: (conta: ContaPagar) => void;
  onDelete: (contaId: string) => void;
}

const getStatusBadge = (status?: 'pendente' | 'pago' | 'atrasado' | 'parcial') => {
  const statusConfig = {
    pendente: { variant: "secondary" as const, label: "Pendente", icon: Clock },
    pago: { variant: "default" as const, label: "Pago", icon: CheckCircle, className: "bg-green-100 text-green-800" },
    atrasado: { variant: "destructive" as const, label: "Atrasado", icon: AlertCircle },
    parcial: { variant: "outline" as const, label: "Parcial", icon: DollarSign }
  };
  
  if (!status || !statusConfig[status]) {
      return <Badge variant="outline">N/A</Badge>;
  }
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className={cn("flex items-center gap-1", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export function ContasPagarTable({ contas, onAbrirDialogPagamento, onEdit, onDelete }: ContasPagarTableProps) {
  const getActionsForConta = (conta: ContaPagar): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        type: 'edit',
        label: 'Editar',
        onClick: () => onEdit(conta),
      }
    ];

    if (conta.status === 'pendente' || conta.status === 'atrasado') {
      actions.push({
        type: 'register',
        label: 'Marcar como Paga',
        onClick: () => onAbrirDialogPagamento(conta.id),
        variant: 'success',
      });
    }

    actions.push({
      type: 'delete',
      label: 'Excluir',
      onClick: () => onDelete(conta.id),
      variant: 'destructive',
    });

    return actions;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Contas a Pagar</CardTitle>
        <CardDescription>
          {contas.length} conta(s) encontrada(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[450px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                          Nenhuma conta encontrada.
                      </TableCell>
                  </TableRow>
              ) : (
                  contas.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">{conta.descricao}</TableCell>
                    <TableCell>{conta.fornecedor}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{conta.categoria}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {currencyFormatter.format(conta.valor)}
                    </TableCell>
                    <TableCell>
                      {format(conta.dataVencimento, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(conta.status)}</TableCell>
                    <TableCell className="text-right">
                      <ActionExpandableTabs actions={getActionsForConta(conta)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
