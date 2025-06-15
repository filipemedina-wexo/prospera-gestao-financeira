
import React from "react";
import { ExtratoTransacao } from "./types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ExtratoTabelaProps {
  extratoAgrupado: { [dia: string]: ExtratoTransacao[] };
  useRealData: boolean;
}

export const ExtratoTabela: React.FC<ExtratoTabelaProps> = ({
  extratoAgrupado,
  useRealData,
}) => {
  return (
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
                  {!useRealData && <th className="px-4 py-2 text-right">Saldo Após</th>}
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
                    {!useRealData && (
                        <td className="px-4 py-2 text-right text-blue-900">
                            R$ {tx.saldoApos.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                            })}
                        </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
