
import * as z from "zod";

export const planSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nome do plano é obrigatório"),
  description: z.string().optional().nullable(),
  type: z.enum(['basic', 'premium', 'enterprise'], {
    required_error: "Tipo do plano é obrigatório",
  }),
  monthly_price: z.coerce.number().min(0, "Preço mensal não pode ser negativo"),
  yearly_price: z.coerce.number().min(0, "Preço anual não pode ser negativo").optional().nullable(),
  max_users: z.coerce.number().int().min(1, "Mínimo de 1 usuário"),
  features: z.string().optional(), // Raw string from textarea
  is_active: z.boolean().default(true),
});

export type PlanFormValues = z.infer<typeof planSchema>;
