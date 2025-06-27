
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Trash2, CheckCircle } from "lucide-react";
import { ContaPagar } from "./types";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";

interface ContasPagarTableProps {
  contas: ContaPagar[];
  onAbrirDialogPagamento: (conta: ContaPagar) => void;
  onEdit: (conta: ContaPagar) => void;
  onDelete: (id: string) => void;
}

export function ContasPagarTable({ contas, onAbrirDialogPagamento, onEdit, onDelete }: ContasPagarTableProps) {
  const getStatusBadge = (status: ContaPagar['status']) => {
    const variants = {
      pendente: 'secondary',
      pago: 'default',
      atrasado: 'destructive',
      parcial: 'outline',
    } as const;

    const labels = {
      pendente: 'Pendente',
      pago: 'Pago',
      atrasado: 'Atrasado',
      parcial: 'Parcial',
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

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
        label: 'Registrar Pagamento',
        onClick: () => onAbrirDialogPagamento(conta),
        variant: 'success'
      });
    }

    actions.push({
      type: 'delete',
      label: 'Excluir',
      onClick: () => onDelete(conta.id),
      variant: 'destructive'
    });

    return actions;
  };

  if (contas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma conta encontrada.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data de Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contas.map((conta) => (
            <TableRow key={conta.id}>
              <TableCell className="font-medium">{conta.descricao}</TableCell>
              <TableCell>{conta.fornecedor}</TableCell>
              <TableCell>{conta.categoria}</TableCell>
              <TableCell>{format(conta.dataVencimento, "dd/MM/yyyy")}</TableCell>
              <TableCell>{getStatusBadge(conta.status)}</TableCell>
              <TableCell className="text-right font-semibold">
                {conta.valor.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </TableCell>
              <TableCell className="text-right">
                <ActionsDropdown actions={getActionsForConta(conta)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
