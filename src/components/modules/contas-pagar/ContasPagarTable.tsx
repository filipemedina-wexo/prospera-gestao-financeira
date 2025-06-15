
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ContaPagar } from "./types";
import { currencyFormatter } from "./config";

interface ContasPagarTableProps {
  contas: ContaPagar[];
  onAbrirDialogPagamento: (contaId: string) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pendente: { variant: "secondary" as const, label: "Pendente", icon: Clock },
    pago: { variant: "default" as const, label: "Pago", icon: CheckCircle },
    atrasado: { variant: "destructive" as const, label: "Atrasado", icon: AlertCircle },
    parcial: { variant: "outline" as const, label: "Parcial", icon: DollarSign }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig];
  if (!config) return null;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export function ContasPagarTable({ contas, onAbrirDialogPagamento }: ContasPagarTableProps) {
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
                <TableHead>Competência</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contas.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
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
                    <TableCell>{conta.competencia || '-'}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {currencyFormatter.format(conta.valor)}
                    </TableCell>
                    <TableCell>
                      {format(conta.dataVencimento, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(conta.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex space-x-2 justify-end">
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                        {(conta.status === 'pendente' || conta.status === 'atrasado') && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onAbrirDialogPagamento(conta.id)}>
                            Pagar
                          </Button>
                        )}
                      </div>
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
