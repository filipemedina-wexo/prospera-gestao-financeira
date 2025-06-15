
import * as z from "zod";

export const clientSchema = z.object({
  company_name: z.string().min(1, "Nome da empresa é obrigatório"),
  contact_name: z.string().min(1, "Nome do contato é obrigatório"),
  contact_email: z.string().email("Email inválido"),
  contact_phone: z.string().optional(),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.enum(['active', 'blocked', 'trial', 'suspended']),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
