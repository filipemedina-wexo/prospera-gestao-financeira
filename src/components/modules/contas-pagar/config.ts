
import { z } from "zod";

export const formSchema = z.object({
  descricao: z.string().min(1, { message: "Descrição é obrigatória." }),
  valor: z.preprocess(
    (a) => parseFloat(String(a).replace(",", ".")),
    z.number().positive({ message: "O valor deve ser positivo." })
  ),
  dataVencimento: z.date({ required_error: "Data de vencimento é obrigatória." }),
  fornecedor_id: z.string().min(1, "Fornecedor é obrigatório."),
  categoria_id: z.string({ required_error: "Categoria é obrigatória." }).min(1, "Categoria é obrigatória."),
  numeroDocumento: z.string().optional(),
  observacoes: z.string().optional(),
  competencia: z.string().regex(/^(|\d{2}\/\d{4})$/, "Formato inválido (MM/AAAA)").optional(),
  recorrente: z.boolean().default(false),
  frequencia: z.enum(['mensal', 'bimestral', 'trimestral', 'semestral', 'anual']).optional(),
  numParcelas: z.preprocess(
    (a) => a ? parseInt(String(a), 10) : undefined,
    z.number().int().positive().optional()
  ),
}).superRefine((data, ctx) => {
    if (data.recorrente) {
        if (!data.frequencia) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["frequencia"],
                message: "Frequência é obrigatória para contas recorrentes.",
            });
        }
        if (!data.numParcelas || data.numParcelas <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["numParcelas"],
                message: "Número de parcelas é obrigatório.",
            });
        }
    }
});

export const categorias = [
  "Despesas Fixas",
  "Despesas Variáveis", 
  "Despesas Administrativas",
  "Despesas Operacionais",
  "Marketing",
  "Custos de Mercadoria",
  "Despesas Financeiras"
];

export const formasPagamento = [
  "Boleto",
  "Transferência",
  "Cartão de Crédito",
  "PIX",
  "Dinheiro",
  "Cheque"
];

export const opcoesFrequencia = [
    { value: 'mensal' as const, label: 'Mensal' },
    { value: 'bimestral' as const, label: 'Bimestral' },
    { value: 'trimestral' as const, label: 'Trimestral' },
    { value: 'semestral' as const, label: 'Semestral' },
    { value: 'anual' as const, label: 'Anual' },
];

export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});
