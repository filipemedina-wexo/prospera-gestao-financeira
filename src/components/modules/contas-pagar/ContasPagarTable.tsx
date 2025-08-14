
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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
      cancelado: 'outline',
    } as const;

    const labels = {
      pendente: 'Pendente',
      pago: 'Pago',
      atrasado: 'Atrasado',
      cancelado: 'Cancelado',
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getActionsForConta = (conta: ContaPagar): ActionItem[] => {
    return [
      {
        type: 'edit',
        label: 'Editar',
        onClick: () => onEdit(conta),
      },
      {
        type: 'register',
        label: 'Registrar Pagamento',
        onClick: () => onAbrirDialogPagamento(conta),
        disabled: conta.status === 'pago' || conta.status === 'cancelado',
        variant: 'success'
      },
      {
        type: 'delete',
        label: 'Excluir',
        onClick: () => onDelete(conta.id),
        variant: 'destructive'
      }
    ];
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
