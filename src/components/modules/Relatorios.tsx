
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, FileText, AlertTriangle, TrendingDown, Calendar, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function Relatorios() {
  const despesasPorCategoria = [
    { categoria: "Marketing", valor: 15000 },
    { categoria: "Escritório", valor: 8000 },
    { categoria: "Viagem", valor: 5000 },
    { categoria: "Software", valor: 3000 },
    { categoria: "Telefonia", valor: 2000 }
  ];

  const inadimplentes = [
    { cliente: "João Silva", valor: 5500, diasAtraso: 45, telefone: "(11) 99999-0001" },
    { cliente: "Maria Santos", valor: 3200, diasAtraso: 30, telefone: "(11) 99999-0002" },
    { cliente: "Pedro Costa", valor: 8900, diasAtraso: 60, telefone: "(11) 99999-0003" },
    { cliente: "Ana Oliveira", valor: 2100, diasAtraso: 15, telefone: "(11) 99999-0004" }
  ];

  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Relatórios</h1>
      </div>

      <Tabs defaultValue="despesas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="inadimplencia">Inadimplência</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="despesas" className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input id="data-inicio" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input id="data-fim" type="date" />
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição de despesas nos últimos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={despesasPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="categoria" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                    <Bar dataKey="valor" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Despesas</CardTitle>
                <CardDescription>Proporção de gastos por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={despesasPorCategoria}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                    >
                      {despesasPorCategoria.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumo de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">R$ 33.000</div>
                  <div className="text-sm text-muted-foreground">Total de Despesas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">R$ 15.000</div>
                  <div className="text-sm text-muted-foreground">Maior Categoria</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">R$ 1.100</div>
                  <div className="text-sm text-muted-foreground">Média Diária</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">5</div>
                  <div className="text-sm text-muted-foreground">Categorias</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inadimplencia" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Total em Atraso: R$ 19.700</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <span className="font-medium">4 Clientes Inadimplentes</span>
              </div>
            </div>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exportar Lista
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Clientes Inadimplentes
              </CardTitle>
              <CardDescription>
                Lista de clientes com pagamentos em atraso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 font-medium border-b pb-2">
                  <div>Cliente</div>
                  <div>Valor (R$)</div>
                  <div>Dias em Atraso</div>
                  <div>Telefone</div>
                  <div>Ações</div>
                </div>
                {inadimplentes.map((cliente, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 items-center py-2 border-b">
                    <div className="font-medium">{cliente.cliente}</div>
                    <div className="text-red-600 font-semibold">R$ {cliente.valor.toFixed(2)}</div>
                    <div className={`font-semibold ${
                      cliente.diasAtraso > 45 ? 'text-red-600' : 
                      cliente.diasAtraso > 30 ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {cliente.diasAtraso} dias
                    </div>
                    <div className="text-muted-foreground">{cliente.telefone}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Contatar</Button>
                      <Button variant="outline" size="sm">Negociar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Até 30 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">R$ 2.100</div>
                <p className="text-sm text-muted-foreground">1 cliente</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">31 a 60 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">R$ 8.700</div>
                <p className="text-sm text-muted-foreground">2 clientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Acima de 60 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">R$ 8.900</div>
                <p className="text-sm text-muted-foreground">1 cliente</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vendas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório de Vendas</CardTitle>
              <CardDescription>Análise de vendas por período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Relatório de vendas em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Financeiro</CardTitle>
              <CardDescription>Análise financeira completa</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Relatório financeiro em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
