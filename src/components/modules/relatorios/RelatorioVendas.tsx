
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RelatorioVendasProps {
  dados: {
    totalVendas: number;
    metaMensal: number;
    percentualMeta: number;
    vendasPorVendedor: { vendedor: string; vendas: number; meta: number }[];
  }
}

export function RelatorioVendas({ dados }: RelatorioVendasProps) {
  if (dados.totalVendas === 0 && dados.vendasPorVendedor.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Aguardando dados relevantes para gerar informações</p>
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
                <p className="text-sm font-medium text-muted-foreground">Vendas do Mês</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {dados.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meta Mensal</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {dados.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">% da Meta</p>
                <p className="text-2xl font-bold text-green-600">
                  {dados.percentualMeta}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <PieChart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Performance por Vendedor</CardTitle>
          <CardDescription>Vendas individuais vs. metas</CardDescription>
        </CardHeader>
        <CardContent>
          {dados.vendasPorVendedor.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Nenhum vendedor com vendas registradas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dados.vendasPorVendedor.map((vendedor, index) => {
              const percentualMeta = (vendedor.vendas / vendedor.meta) * 100;
              return (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{vendedor.vendedor}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className={`h-3 rounded-full ${percentualMeta >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(percentualMeta, 100)}%` }} />
                        </div>
                      </div>
                      <Badge variant={percentualMeta >= 100 ? "default" : "secondary"}>
                        {percentualMeta.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <p className="font-semibold">
                      R$ {vendedor.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Meta: R$ {vendedor.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
