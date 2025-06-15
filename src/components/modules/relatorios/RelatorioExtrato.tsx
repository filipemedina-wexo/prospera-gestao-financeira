
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as LucideCalendar, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { format, isWithinInterval, addDays, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import React from "react";

type ExtratoTransacao = {
  id: string;
  data: Date;
  tipo: "entrada" | "saida";
  descricao: string;
  valor: number;
  categoria: string;
  saldoApos: number;
};

interface RelatorioExtratoProps {
  extratoPeriodoInicio: Date | undefined;
  extratoPeriodoFim: Date | undefined;
  setExtratoPeriodoInicio: (d: Date | undefined) => void;
  setExtratoPeriodoFim: (d: Date | undefined) => void;
}

function gerarMockExtratoTransacoes(
  inicio: Date,
  fim: Date
): ExtratoTransacao[] {
  const baseDate = subDays(new Date(), 20);
  let saldo = 42800.0;
  let transacoes: ExtratoTransacao[] = [];
  for (let i = 0; i < 30; i++) {
    const dia = addDays(baseDate, i);
    if (isWithinInterval(dia, { start: inicio, end: fim })) {
      saldo += 1000.0;
      transacoes.push({
        id: `in-${i}`,
        data: new Date(dia),
        tipo: "entrada",
        descricao: "Recebimento Cliente ABC",
        valor: 1000.0,
        categoria: "Recebimentos",
        saldoApos: saldo,
      });
      saldo -= 300.0;
      transacoes.push({
        id: `out-${i}`,
        data: new Date(dia),
        tipo: "saida",
        descricao: "Pagamento Fornecedor XYZ",
        valor: 300.0,
        categoria: "Despesas",
        saldoApos: saldo,
      });
    }
  }
  return transacoes.sort((a, b) => {
    if (a.data.getTime() !== b.data.getTime())
      return a.data.getTime() - b.data.getTime();
    if (a.tipo === b.tipo) return 0;
    return a.tipo === "entrada" ? -1 : 1;
  });
}

function agruparTransacoesPorDia(transacoes: ExtratoTransacao[]) {
  const agrupado: { [dia: string]: ExtratoTransacao[] } = {};
  transacoes.forEach((tx) => {
    const dia = format(tx.data, "dd/MM/yyyy");
    if (!agrupado[dia]) agrupado[dia] = [];
    agrupado[dia].push(tx);
  });
  return agrupado;
}

export const RelatorioExtrato: React.FC<RelatorioExtratoProps> = ({
  extratoPeriodoInicio,
  extratoPeriodoFim,
  setExtratoPeriodoInicio,
  setExtratoPeriodoFim,
}) => {
  const transacoesExtrato =
    extratoPeriodoInicio && extratoPeriodoFim
      ? gerarMockExtratoTransacoes(extratoPeriodoInicio, extratoPeriodoFim)
      : [];
  const extratoAgrupado = agruparTransacoesPorDia(transacoesExtrato);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <List className="h-5 w-5 text-indigo-600" />
            Extrato Financeiro
          </div>
        </CardTitle>
        <CardDescription>
          Visão detalhada de entradas e saídas por dia, como em extratos bancários.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b">
          <div>
            <span className="font-medium text-sm">Período:</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-40 justify-start text-left font-normal",
                  !extratoPeriodoInicio && "text-muted-foreground"
                )}
              >
                <LucideCalendar className="mr-2 h-4 w-4" />
                {extratoPeriodoInicio
                  ? format(extratoPeriodoInicio, "dd/MM/yyyy")
                  : <span>Data inicial</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ShadcnCalendar
                mode="single"
                selected={extratoPeriodoInicio}
                onSelect={setExtratoPeriodoInicio}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                disabled={
                  (date) => extratoPeriodoFim && date > extratoPeriodoFim
                }
              />
            </PopoverContent>
          </Popover>
          <span>até</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-40 justify-start text-left font-normal",
                  !extratoPeriodoFim && "text-muted-foreground"
                )}
              >
                <LucideCalendar className="mr-2 h-4 w-4" />
                {extratoPeriodoFim
                  ? format(extratoPeriodoFim, "dd/MM/yyyy")
                  : <span>Data final</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <ShadcnCalendar
                mode="single"
                selected={extratoPeriodoFim}
                onSelect={setExtratoPeriodoFim}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                disabled={
                  (date) => extratoPeriodoInicio && date < extratoPeriodoInicio
                }
              />
            </PopoverContent>
          </Popover>
        </div>
        {Object.keys(extratoAgrupado).length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            Nenhuma movimentação no período selecionado.
          </div>
        )}
        <div className="divide-y">
          {Object.entries(extratoAgrupado).map(([dia, transacoesDia]) => (
            <div key={dia} className="py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-blue-900">{dia}</span>
                <span className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-500">
                  {transacoesDia.length} mov.
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm rounded">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-2 text-left">Horário</th>
                      <th className="px-4 py-2 text-left">Descrição</th>
                      <th className="px-4 py-2 text-left">Tipo</th>
                      <th className="px-4 py-2 text-left">Categoria</th>
                      <th className="px-4 py-2 text-right">Valor</th>
                      <th className="px-4 py-2 text-right">Saldo Após</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoesDia.map((tx) => (
                      <tr key={tx.id} className="border-b last:border-0">
                        <td className="px-4 py-2">
                          {format(tx.data, "HH:mm")}
                        </td>
                        <td className="px-4 py-2">{tx.descricao}</td>
                        <td className="px-4 py-2">
                          <Badge
                            variant={tx.tipo === "entrada" ? "outline" : "secondary"}
                            className={
                              tx.tipo === "entrada"
                                ? "text-green-600 border-green-200"
                                : "text-red-600 border-red-200"
                            }
                          >
                            {tx.tipo === "entrada" ? "Entrada" : "Saída"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">{tx.categoria}</td>
                        <td
                          className={`px-4 py-2 text-right font-medium ${
                            tx.tipo === "entrada"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {tx.tipo === "entrada" ? "+" : "-"} R$ {tx.valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2
                          })}
                        </td>
                        <td className="px-4 py-2 text-right text-blue-900">
                          R$ {tx.saldoApos.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
