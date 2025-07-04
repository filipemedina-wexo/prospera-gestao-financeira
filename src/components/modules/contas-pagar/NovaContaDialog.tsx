import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formSchema, opcoesFrequencia } from "./config";
import { useClientCategories } from "@/hooks/useClientCategories";
import { useQuery } from "@tanstack/react-query";
import { financialClientsService } from "@/services/financialClientsService";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { ContaPagar } from "./types";

interface NovaContaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  contaToEdit?: ContaPagar | null;
}

export function NovaContaDialog({ open, onOpenChange, onSubmit, contaToEdit }: NovaContaDialogProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { currentClientId } = useMultiTenant();
  const { categories } = useClientCategories();
  
  const { data: fornecedores } = useQuery({
    queryKey: ['financial-clients', currentClientId],
    queryFn: () => currentClientId ? financialClientsService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: "",
      valor: 0,
      fornecedor_id: "",
      categoria_id: "",
      dataVencimento: new Date(),
      recorrente: false,
    },
  });

  useEffect(() => {
    if (open && contaToEdit) {
      form.reset({
        descricao: contaToEdit.descricao,
        valor: contaToEdit.valor,
        dataVencimento: new Date(contaToEdit.dataVencimento),
        categoria_id: contaToEdit.categoria_id,
        fornecedor_id: contaToEdit.fornecedor_id,
        recorrente: contaToEdit.recorrente || false,
        frequencia: contaToEdit.frequencia,
        numParcelas: contaToEdit.numParcelas
      });
    } else {
      form.reset({
        descricao: "",
        valor: 0,
        dataVencimento: new Date(),
        categoria_id: "",
        fornecedor_id: "",
        recorrente: false,
      });
    }
  }, [open, contaToEdit, form]);


  const isRecorrente = form.watch("recorrente");
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!contaToEdit && (
        <DialogTrigger asChild>
          <Button onClick={() => onOpenChange(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{contaToEdit ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}</DialogTitle>
           <DialogDescription>
            {contaToEdit ? 'Atualize as informações da conta.' : 'Preencha os dados para criar uma nova conta.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="descricao" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="valor" render={({ field }) => (<FormItem><FormLabel>Valor</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="dataVencimento" render={({ field }) => (
                    <FormItem className="flex flex-col pt-2"><FormLabel>Data de Vencimento</FormLabel>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={(date) => { if(date) {field.onChange(date); setCalendarOpen(false); }}} initialFocus /></PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )} />
                <FormField control={form.control} name="categoria_id" render={({ field }) => (
                    <FormItem><FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                        <SelectContent>{expenseCategories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )} />
                </div>

                <FormField control={form.control} name="fornecedor_id" render={({ field }) => (
                <FormItem><FormLabel>Fornecedor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                    <SelectContent>{(fornecedores || []).map((f) => (<SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )} />

                <div className="flex items-center space-x-2">
                    <FormField control={form.control} name="recorrente" render={({ field }) => (<FormItem><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={!!contaToEdit} /></FormControl></FormItem>)} />
                    <Label htmlFor="recorrente">Conta recorrente</Label>
                </div>

                {isRecorrente && (
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded">
                    <FormField control={form.control} name="frequencia" render={({ field }) => (<FormItem><FormLabel>Frequência</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{opcoesFrequencia.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="numParcelas" render={({ field }) => (<FormItem><FormLabel>Nº de Parcelas</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                    </Button>
                    <Button type="submit">
                    {contaToEdit ? 'Salvar Alterações' : 'Criar Conta'}
                    </Button>
                </div>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}