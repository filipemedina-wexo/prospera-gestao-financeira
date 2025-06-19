import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Fornecedor, TipoFornecedor } from "./types"; // Manteremos o tipo por enquanto para simplicidade
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const clientSchema = z.object({
  razaoSocial: z.string().min(3, "Nome/Razão Social é obrigatório"),
  cnpj: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
  telefone: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface FinancialClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (client: Partial<Fornecedor>) => void; // Usando Fornecedor como tipo base
  client: Partial<Fornecedor> | null;
  title: string;
}

export const FinancialClientDialog = ({ open, onOpenChange, onSave, client, title }: FinancialClientDialogProps) => {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { razaoSocial: '', cnpj: '', email: '', telefone: '' },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        razaoSocial: client.razaoSocial,
        cnpj: client.cnpj,
        email: client.email,
        telefone: client.telefone,
      });
    } else {
      form.reset({ razaoSocial: '', cnpj: '', email: '', telefone: '' });
    }
  }, [client, open, form]);

  const onSubmit = (data: ClientFormData) => {
    onSave({
      id: client?.id,
      ...data
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preencha as informações principais. Mais detalhes podem ser adicionados depois.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="razaoSocial" render={({ field }) => ( <FormItem><FormLabel>Nome / Razão Social</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="cnpj" render={({ field }) => ( <FormItem><FormLabel>CPF / CNPJ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="telefone" render={({ field }) => ( <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};