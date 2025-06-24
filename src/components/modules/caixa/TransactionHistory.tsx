
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { financialTransactionsService, FinancialTransaction } from "@/services/financialTransactionsService";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionHistoryProps {
  bankAccountId?: string;
}

export function TransactionHistory({ bankAccountId }: TransactionHistoryProps) {
  const { currentClientId } = useMultiTenant();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['financial-transactions', currentClientId, bankAccountId],
    queryFn: () => {
      if (bankAccountId) {
        return financialTransactionsService.getByBankAccount(bankAccountId);
      }
      return financialTransactionsService.getAll();
    },
    enabled: !!currentClientId,
  });

  const getTransactionIcon = (type: string) => {
    return type === 'income' ? (
      <ArrowUpIcon className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-red-600" />
    );
  };

  const getTransactionBadge = (type: string) => {
    return type === 'income' ? (
      <Badge variant="outline" className="text-green-700 border-green-300">
        <TrendingUp className="h-3 w-3 mr-1" />
        Receita
      </Badge>
    ) : (
      <Badge variant="outline" className="text-red-700 border-red-300">
        <TrendingDown className="h-3 w-3 mr-1" />
        Despesa
      </Badge>
    );
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Transações</CardTitle>
        <CardDescription>
          {transactions?.length || 0} transação(ões) encontrada(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!transactions || transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction: FinancialTransaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(parseISO(transaction.transaction_date), "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        {transaction.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.category || 'Sem categoria'}</Badge>
                    </TableCell>
                    <TableCell>
                      {getTransactionBadge(transaction.type)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.amount.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </span>
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
