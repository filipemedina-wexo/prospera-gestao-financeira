import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, BarChart, Bar
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

const COLORS = ["#34d399", "#60a5fa", "#f59e42", "#f43f5e", "#818cf8"];

const costCategoriesMock = [
  { name: "Salários", value: 8500 },
  { name: "Aluguel", value: 2700 },
  { name: "Serviços", value: 1950 },
  { name: "Tributos", value: 1600 },
  { name: "Outros", value: 900 },
];

// Substituir antigo faturamentoMetaMock pelo novo modelo mensal:
const faturamentoMensalMock = [
  { mes: "Jan", faturamento: 7000, metaAcumulada: 10000 },
  { mes: "Fev", faturamento: 8500, metaAcumulada: 20000 },
  { mes: "Mar", faturamento: 9600, metaAcumulada: 30000 },
  { mes: "Abr", faturamento: 10500, metaAcumulada: 40000 },
  { mes: "Mai", faturamento: 11000, metaAcumulada: 50000 },
  { mes: "Jun", faturamento: 9000, metaAcumulada: 60000 },
  { mes: "Jul", faturamento: 10200, metaAcumulada: 70000 },
  { mes: "Ago", faturamento: 11300, metaAcumulada: 80000 },
  { mes: "Set", faturamento: 9900, metaAcumulada: 90000 },
  { mes: "Out", faturamento: 12000, metaAcumulada: 100000 },
  { mes: "Nov", faturamento: 10800, metaAcumulada: 110000 },
  { mes: "Dez", faturamento: 11500, metaAcumulada: 120000 },
];

// Novo array com campo "faturamentoAcumulado"
const faturamentoMensalAcumuladoMock = faturamentoMensalMock.map((item, idx, arr) => {
  const acumulado =
    arr.slice(0, idx + 1).reduce((sum, cur) => sum + cur.faturamento, 0);
  return { ...item, faturamentoAcumulado: acumulado };
});

const extratoHojeMock = [
  { hora: "08:21", descricao: "Recebimento Cliente XPTO", valor: 3500 },
  { hora: "10:09", descricao: "Pagamento Energia", valor: -370 },
  { hora: "14:21", descricao: "Recebimento PIX", valor: 750 },
  { hora: "16:10", descricao: "Pagamento Fornecedor ABC", valor: -900 },
];

const receitaPorDiaMock = [
  { day: "01", Receita: 0, Débito: 300 },
  { day: "02", Receita: 1000, Débito: 0 },
  { day: "03", Receita: 3400, Débito: 500 },
  { day: "04", Receita: 1900, Débito: 850 },
  { day: "05", Receita: 1200, Débito: 400 },
  { day: "06", Receita: 2500, Débito: 1000 },
  { day: "07", Receita: 4350, Débito: 230 },
];

// Novo array acumulado para receita e débito dos últimos 7 dias
const receitaPorDiaAcumuladoMock = receitaPorDiaMock.map((item, idx, arr) => {
  const receitaAcumulada = arr.slice(0, idx + 1).reduce((sum, cur) => sum + cur.Receita, 0);
  const debitoAcumulado = arr.slice(0, idx + 1).reduce((sum, cur) => sum + cur.Débito, 0);
  return {
    ...item,
    Receita: receitaAcumulada,
    Débito: debitoAcumulado,
  };
});

export function QuickChartsSection() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6">
      {/* Gráfico Pizza Categoria de Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Custos por Categoria
            <Badge variant="outline" className="text-gray-500">Mês Atual</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={costCategoriesMock}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                label={({ name }) => name}
              >
                {costCategoriesMock.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <RechartsTooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* LineChart Faturamento vs Meta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Faturamento vs. Meta
            <Badge variant="secondary" className="text-blue-700">Ano</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={faturamentoMensalAcumuladoMock}>
              <XAxis dataKey="mes" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="faturamentoAcumulado"
                name="Faturamento Acumulado"
                stroke="#34d399"
                strokeWidth={2}
                dot
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="metaAcumulada"
                name="Meta Acumulada"
                stroke="#60a5fa"
                strokeDasharray="6 3"
                strokeWidth={2}
                dot={false}
              />
              <Legend />
              <RechartsTooltip
                formatter={(value: number, name: string) =>
                  [`R$ ${value.toLocaleString('pt-BR')}`, name]
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* Extrato do Dia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Extrato de Hoje
            <Info className="w-4 h-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-56 overflow-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left text-muted-foreground pb-1">Hora</th>
                  <th className="text-left text-muted-foreground pb-1">Descrição</th>
                  <th className="text-right text-muted-foreground pb-1">Valor</th>
                </tr>
              </thead>
              <tbody>
                {extratoHojeMock.map((l, idx) => (
                  <tr key={idx}>
                    <td className="pr-2">{l.hora}</td>
                    <td className="pr-2">{l.descricao}</td>
                    <td className={`text-right font-semibold ${l.valor >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {l.valor >= 0 ? "+" : "-"} R$ {Math.abs(l.valor).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!extratoHojeMock.length && (
              <div className="text-center text-muted-foreground mt-4">Nenhuma movimentação hoje.</div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* LineChart Receita e Débitos por dia */}
      <Card className="col-span-1 md:col-span-2 2xl:col-span-1">
        <CardHeader>
          <CardTitle>
            Receita e Débitos (Últimos 7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={receitaPorDiaAcumuladoMock}>
              <XAxis dataKey="day" tickFormatter={d => d + "/06"} />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Receita" stroke="#22c55e" strokeWidth={2} dot />
              <Line type="monotone" dataKey="Débito" stroke="#f43f5e" strokeWidth={2} dot />
              <Legend />
              <RechartsTooltip formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR')}`, name]} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}

export default QuickChartsSection;
