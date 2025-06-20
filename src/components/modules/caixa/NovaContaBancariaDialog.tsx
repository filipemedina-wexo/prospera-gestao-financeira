import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BankAccount } from "@/services/bankAccountsService";

const formSchema = z.object({
  name: z.string().min(3, "O nome da conta é obrigatório."),
  bank_name: z.string().min(2, "O nome do banco é obrigatório."),
  initial_balance: z.coerce.number().min(0, "O saldo deve ser zero ou maior."),
  type: z.enum(["corrente", "poupanca", "investimento"]),
  agency: z.string().optional(),
  account_number: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NovaContaBancariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: FormValues) => void;
  contaToEdit?: BankAccount | null;
}

export function NovaContaBancariaDialog({ open, onOpenChange, onSave, contaToEdit }: NovaContaBancariaDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      if (contaToEdit) {
        form.reset(contaToEdit);
      } else {
        form.reset({
          name: "", bank_name: "", initial_balance: 0, type: "corrente", agency: "", account_number: ""
        });
      }
    }
  }, [open, contaToEdit, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contaToEdit ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}</DialogTitle>
          <DialogDescription>Preencha os dados da conta para começar a registrar movimentações.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Apelido da Conta *</FormLabel><FormControl><Input placeholder="Ex: Conta Principal" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="bank_name" render={({ field }) => (<FormItem><FormLabel>Nome do Banco *</FormLabel><FormControl><Input placeholder="Ex: Banco do Brasil" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="initial_balance" render={({ field }) => (<FormItem><FormLabel>Saldo Inicial *</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="agency" render={({ field }) => (<FormItem><FormLabel>Agência</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="account_number" render={({ field }) => (<FormItem><FormLabel>Conta</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Tipo *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="corrente">Corrente</SelectItem><SelectItem value="poupanca">Poupança</SelectItem><SelectItem value="investimento">Investimento</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}