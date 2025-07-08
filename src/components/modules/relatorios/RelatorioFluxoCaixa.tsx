
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, DollarSign, CreditCard } from "lucide-react";

interface RelatorioFluxoCaixaProps {
  dados: {
    totalEntradas: number;
    totalSaidas: number;
    saldoLiquido: number;
    entradasPorCategoria: { categoria: string; valor: number; percentual: number }[];
    saidasPorCategoria: { categoria: string; valor: number; percentual: number }[];
  }
}

export function RelatorioFluxoCaixa({ dados }: RelatorioFluxoCaixaProps) {
  // Verificar se há dados suficientes
  const hasData = dados.totalEntradas > 0 || dados.totalSaidas > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Fluxo de Caixa</CardTitle>
            <CardDescription>Análise de entradas e saídas financeiras.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aguardando dados relevantes</h3>
              <p className="text-muted-foreground">
                Aguardando dados relevantes para gerar informações sobre fluxo de caixa.
                <br />
                Cadastre contas a pagar e receber para visualizar este relatório.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {dados.totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <p className="text-sm font-medium text-muted-foreground">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  R$ {dados.totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                <p className="text-sm font-medium text-muted-foreground">Saldo Líquido</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {dados.saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Entradas por Categoria</CardTitle>
            <CardDescription>Distribuição das receitas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dados.entradasPorCategoria.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.categoria}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${item.percentual}%` }} />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold">
                      R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.percentual}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">Saídas por Categoria</CardTitle>
            <CardDescription>Distribuição das despesas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dados.saidasPorCategoria.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.categoria}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${item.percentual}%` }} />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold">
                      R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.percentual}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
