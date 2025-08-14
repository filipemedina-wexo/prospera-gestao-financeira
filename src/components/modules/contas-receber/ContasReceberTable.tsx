
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ContaReceber } from "./types";
import { cn } from "@/lib/utils";
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown";
interface ContasReceberTableProps {
  contas: ContaReceber[];
  onEdit: (conta: ContaReceber) => void;
  onDelete: (conta: ContaReceber) => void;
  onReceber: (conta: ContaReceber) => void;
}

const getStatusBadge = (status?: ContaReceber['status']) => {
    const statusConfig: Record<string, { variant: "secondary" | "default" | "destructive" | "outline"; label: string; icon: any; className?: string }> = {
      pendente: { variant: "secondary" as const, label: "Pendente", icon: Clock },
      recebido: { variant: "default" as const, label: "Recebido", icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      atrasado: { variant: "destructive" as const, label: "Atrasado", icon: AlertCircle },
      cancelado: { variant: "outline" as const, label: "Cancelado", icon: XCircle }
    };
    if (!status || !statusConfig[status]) {
        return <Badge variant="outline">N/A</Badge>;
    }
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={cn("flex items-center gap-1 w-28 justify-center", config.className)}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
};

export function ContasReceberTable({ contas, onEdit, onDelete, onReceber }: ContasReceberTableProps) {
  const getActionsForConta = (conta: ContaReceber): ActionItem[] => {
    return [
      {
        type: 'edit',
        label: 'Editar',
        onClick: () => onEdit(conta),
      },
      {
        type: 'register',
        label: 'Registrar Recebimento',
        onClick: () => onReceber(conta),
        disabled: conta.status === 'recebido' || conta.status === 'cancelado',
        variant: 'success'
      },
      {
        type: 'delete',
        label: 'Excluir',
        onClick: () => onDelete(conta),
        variant: 'destructive'
      }
    ];
  };

  return (
    <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {contas.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Nenhuma conta encontrada.</TableCell>
                </TableRow>
            ) : (
                contas.map((conta) => (
                <TableRow key={conta.id}>
                    <TableCell className="font-medium">{conta.descricao}</TableCell>
                    <TableCell>{conta.cliente}</TableCell>
                    <TableCell className="font-semibold">{conta.valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</TableCell>
                    <TableCell>{format(conta.dataVencimento, "dd/MM/yyyy")}</TableCell>
                    <TableCell>{getStatusBadge(conta.status)}</TableCell>
                    <TableCell className="text-right">
                      <ActionsDropdown actions={getActionsForConta(conta)} />
                    </TableCell>
                </TableRow>
                ))
            )}
        </TableBody>
    </Table>
  );
}
