
import { ContaReceber } from "../contas-receber/types";
import { ContaPagar } from "../contas-pagar/types";
import { ExtratoTransacao } from "./types";
import { format, isWithinInterval, addDays, subDays } from "date-fns";

export function gerarExtratoComDadosReais(
  contasReceber: ContaReceber[],
  contasPagar: ContaPagar[],
  inicio: Date,
  fim: Date
): ExtratoTransacao[] {
  const transacoes: ExtratoTransacao[] = [];

  contasReceber.forEach(c => {
    if (c.status === 'recebido' && c.dataRecebimento && isWithinInterval(c.dataRecebimento, { start: inicio, end: fim })) {
      transacoes.push({
        id: `rec-${c.id}`,
        data: c.dataRecebimento,
        tipo: 'entrada',
        descricao: c.descricao,
        valor: c.valor,
        categoria: c.categoria,
        saldoApos: 0, // Saldo não pode ser calculado sem saldo inicial
      });
    }
  });

  contasPagar.forEach(c => {
    if (c.status === 'pago' && c.dataPagamento && isWithinInterval(c.dataPagamento, { start: inicio, end: fim })) {
      transacoes.push({
        id: `pag-${c.id}`,
        data: c.dataPagamento,
        tipo: 'saida',
        descricao: c.descricao,
        valor: c.valor,
        categoria: c.categoria,
        saldoApos: 0, // Saldo não pode ser calculado sem saldo inicial
      });
    }
  });

  return transacoes.sort((a, b) => a.data.getTime() - b.data.getTime());
}


export function gerarMockExtratoTransacoes(
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

export function agruparTransacoesPorDia(transacoes: ExtratoTransacao[]) {
  const agrupado: { [dia: string]: ExtratoTransacao[] } = {};
  transacoes.forEach((tx) => {
    const dia = format(tx.data, "dd/MM/yyyy");
    if (!agrupado[dia]) agrupado[dia] = [];
    agrupado[dia].push(tx);
  });
  return agrupado;
}
