import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { formSchema, opcoesFrequencia } from "./config";
import { useClientCategories } from "@/hooks/useClientCategories";
import { useQuery } from "@tanstack/react-query";
import { financialClientsService } from "@/services/financialClientsService";
import { useMultiTenant } from "@/contexts/MultiTenantContext";

interface NovaContaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export function NovaContaDialog({ open, onOpenChange, onSubmit }: NovaContaDialogProps) {
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
      dataVencimento: new Date(),
      categoria: "",
      fornecedor: "",
      recorrente: false,
      frequencia: "mensal",
      numParcelas: 1,
    },
  });

  const isRecorrente = form.watch("recorrente");

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Conta a Pagar</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                {...form.register("descricao")}
                placeholder="Ex: Aluguel escritório"
              />
              {form.formState.errors.descricao && (
                <p className="text-sm text-red-500">{form.formState.errors.descricao.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                {...form.register("valor", { valueAsNumber: true })}
                placeholder="0,00"
              />
              {form.formState.errors.valor && (
                <p className="text-sm text-red-500">{form.formState.errors.valor.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("dataVencimento") ? format(form.watch("dataVencimento"), "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("dataVencimento")}
                    onSelect={(date) => {
                      if (date) {
                        form.setValue("dataVencimento", date);
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select onValueChange={(value) => form.setValue("categoria", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.name}>
                      {categoria.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Select onValueChange={(value) => form.setValue("fornecedor", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {fornecedores?.map((fornecedor) => (
                  <SelectItem key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recorrente"
              checked={form.watch("recorrente")}
              onCheckedChange={(checked) => form.setValue("recorrente", checked as boolean)}
            />
            <Label htmlFor="recorrente">Conta recorrente</Label>
          </div>

          {isRecorrente && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded">
              <div className="space-y-2">
                <Label htmlFor="frequencia">Frequência</Label>
                <Select onValueChange={(value) => form.setValue("frequencia", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcoesFrequencia.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numParcelas">Número de Parcelas</Label>
                <Input
                  id="numParcelas"
                  type="number"
                  min="1"
                  max="360"
                  {...form.register("numParcelas", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isRecorrente ? "Criar Contas" : "Criar Conta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}