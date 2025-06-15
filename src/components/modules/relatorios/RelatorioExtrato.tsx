
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { List } from "lucide-react";
import React from "react";
import { ContaReceber } from "../contas-receber/types";
import { ContaPagar } from "../contas-pagar/types";
import { agruparTransacoesPorDia, gerarExtratoComDadosReais, gerarMockExtratoTransacoes } from "./extratoUtils";
import { ExtratoPeriodoSelector } from "./ExtratoPeriodoSelector";
import { ExtratoTabela } from "./ExtratoTabela";

interface RelatorioExtratoProps {
  extratoPeriodoInicio: Date | undefined;
  extratoPeriodoFim: Date | undefined;
  setExtratoPeriodoInicio: (d: Date | undefined) => void;
  setExtratoPeriodoFim: (d: Date | undefined) => void;
  contasAReceber?: ContaReceber[];
  contasAPagar?: ContaPagar[];
}

export const RelatorioExtrato: React.FC<RelatorioExtratoProps> = ({
  extratoPeriodoInicio,
  extratoPeriodoFim,
  setExtratoPeriodoInicio,
  setExtratoPeriodoFim,
  contasAReceber,
  contasAPagar,
}) => {
  const useRealData = !!(contasAReceber && contasAPagar && extratoPeriodoInicio && extratoPeriodoFim);

  const transacoesExtrato =
    extratoPeriodoInicio && extratoPeriodoFim
      ? useRealData
        ? gerarExtratoComDadosReais(contasAReceber!, contasAPagar!, extratoPeriodoInicio, extratoPeriodoFim)
        : gerarMockExtratoTransacoes(extratoPeriodoInicio, extratoPeriodoFim)
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
        <ExtratoPeriodoSelector
          extratoPeriodoInicio={extratoPeriodoInicio}
          extratoPeriodoFim={extratoPeriodoFim}
          setExtratoPeriodoInicio={setExtratoPeriodoInicio}
          setExtratoPeriodoFim={setExtratoPeriodoFim}
        />
        {Object.keys(extratoAgrupado).length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            Nenhuma movimentação no período selecionado.
          </div>
        ) : (
          <ExtratoTabela extratoAgrupado={extratoAgrupado} useRealData={useRealData} />
        )}
      </CardContent>
    </Card>
  );
};
