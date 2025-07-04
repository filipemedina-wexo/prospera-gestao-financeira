import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ContaReceber } from "./types";
import { FinancialClient, financialClientsService } from "@/services/financialClientsService";
import { Textarea } from "@/components/ui/textarea";
import { FinancialClientDialog } from "../fornecedores/FinancialClientDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória."),
  valor: z.coerce.number().positive("O valor deve ser positivo."),
  dataVencimento: z.date({ required_error: "Data de vencimento é obrigatória." }),
  clienteId: z.string().min(1, "Selecione um cliente."),
  categoria: z.string().min(1, "Selecione uma categoria."),
  competencia: z.string().regex(/^\d{2}\/\d{4}$/, "Formato inválido (MM/AAAA)").optional(),
  observacoes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NovaContaReceberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Partial<ContaReceber>) => void;
  contaToEdit?: ContaReceber | null;
  clientes: FinancialClient[];
  categorias: string[];
}

export function NovaContaReceberDialog({ open, onOpenChange, onSubmit, contaToEdit, clientes, categorias }: NovaContaReceberDialogProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open) {
      if (contaToEdit) {
        form.reset({
          descricao: contaToEdit.descricao,
          valor: contaToEdit.valor,
          dataVencimento: contaToEdit.dataVencimento,
          clienteId: contaToEdit.clienteId,
          categoria: contaToEdit.categoria,
          competencia: contaToEdit.competencia,
          observacoes: contaToEdit.observacoes,
        });
      } else {
        form.reset({
            descricao: "", valor: 0, dataVencimento: new Date(), clienteId: "", categoria: "", competencia: format(new Date(), 'MM/yyyy')
        });
      }
    }
  }, [open, contaToEdit, form]);

  const clientMutation = useMutation({
    mutationFn: (clientData: Partial<any>) => {
      const payload = { name: clientData.razaoSocial, document: clientData.cnpj, email: clientData.email, phone: clientData.telefone };
      return financialClientsService.create(payload);
    },
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: ['financial-clients'] });
      toast({ title: "Cliente criado com sucesso!" });
      form.setValue('clienteId', newClient.id);
      setShowClientDialog(false);
    },
    onError: (error: Error) => toast({ title: "Erro!", description: error.message, variant: 'destructive' })
  });
  
  const handleFormSubmit = (values: FormValues) => {
    onSubmit({ id: contaToEdit?.id, status: contaToEdit?.status, ...values });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{contaToEdit ? 'Editar' : 'Nova'} Conta a Receber</DialogTitle><DialogDescription>Preencha os dados da receita.</DialogDescription></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
              <FormField control={form.control} name="descricao" render={({ field }) => (<FormItem><FormLabel>Descrição *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="valor" render={({ field }) => (<FormItem><FormLabel>Valor *</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Controller control={form.control} name="dataVencimento" render={({ field }) => (
                    <FormItem className="flex flex-col pt-2"><FormLabel>Vencimento *</FormLabel>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}><PopoverTrigger asChild><FormControl><Button variant={"outline"} className="w-full justify-start text-left font-normal">{field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={(d) => { if(d) field.onChange(d); setCalendarOpen(false);}} initialFocus /></PopoverContent></Popover>
                    <FormMessage />
                    </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="clienteId" render={({ field }) => (
                <FormItem><FormLabel>Cliente/Devedor *</FormLabel>
                    <div className="flex items-center gap-2">
                        <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger></FormControl><SelectContent>{(clientes || []).map((cli) => (<SelectItem key={cli.id} value={cli.id}>{cli.name}</SelectItem>))}</SelectContent></Select>
                        <Button type="button" variant="outline" size="icon" onClick={() => setShowClientDialog(true)}><UserPlus className="h-4 w-4" /></Button>
                    </div>
                <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="categoria" render={({ field }) => (<FormItem><FormLabel>Categoria *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent>{categorias.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="competencia" render={({ field }) => (<FormItem><FormLabel>Competência</FormLabel><FormControl><Input placeholder="MM/AAAA" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="observacoes" render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>
              <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <FinancialClientDialog open={showClientDialog} onOpenChange={setShowClientDialog} onSave={(data) => clientMutation.mutate(data)} client={null} title="Novo Cliente/Devedor" />
    </>
  );
}