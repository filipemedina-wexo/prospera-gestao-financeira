import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, CreditCard, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { bankAccountsService } from '@/services/bankAccountsService';
import { reportsService, CashflowReport } from '@/services/reportsService';

export function RelatorioFluxoCaixa() {
  const [accountId, setAccountId] = useState<string | undefined>();
  const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  const { data: accounts } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: () => bankAccountsService.getAll()
  });

  const fromDate = startOfMonth(parse(`${month}-01`, 'yyyy-MM-dd', new Date()));
  const toDate = endOfMonth(fromDate);

  const { data, isLoading } = useQuery<CashflowReport>({
    queryKey: ['cashflow-report', accountId, month],
    queryFn: () =>
      reportsService.getCashflow({
        from: format(fromDate, 'yyyy-MM-dd'),
        to: format(toDate, 'yyyy-MM-dd'),
        accountId
      }),
  });

  const hasData = (data?.series?.length || 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="space-y-2">
          <label className="text-sm font-medium">Conta</label>
          <Select
            value={accountId || 'todas'}
            onValueChange={(v) => setAccountId(v === 'todas' ? undefined : v)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Todas as contas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as contas</SelectItem>
              {accounts?.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Período</label>
          <Input
            type="month"
            className="w-40"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : hasData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Entradas</p>
                    <p className="text-2xl font-bold text-green-600">
                      R$ {data?.in.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Saídas</p>
                    <p className="text-2xl font-bold text-red-600">
                      R$ {data?.out.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Saldo do período</p>
                    <p className={`text-2xl font-bold ${data && data.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      R$ {data?.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Série diária</CardTitle>
              <CardDescription>Entradas, saídas e saldo por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data?.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => format(new Date(d), 'd', { locale: ptBR })} />
                  <YAxis tickFormatter={(v) => v.toLocaleString('pt-BR')} />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} labelFormatter={(label) => format(new Date(label), 'dd/MM', { locale: ptBR })} />
                  <Legend />
                  <Bar dataKey="in" name="Entradas" fill="#22c55e" />
                  <Bar dataKey="out" name="Saídas" fill="#ef4444" />
                  <Line type="monotone" dataKey="net" name="Saldo" stroke="#3b82f6" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <p className="text-muted-foreground">Nenhum dado para o período selecionado.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
