
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Departamento, Funcionario } from "./types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const departamentoSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  responsavelId: z.string().optional(),
});

export type DepartamentoFormValues = z.infer<typeof departamentoSchema>;

interface DepartamentoDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (data: Departamento) => void;
  departamento: Departamento | null;
  funcionarios: Funcionario[];
}

export function DepartamentoDialog({ isOpen, setIsOpen, onSave, departamento, funcionarios }: DepartamentoDialogProps) {
  const { toast } = useToast();
  const [allowNullResponsavel, setAllowNullResponsavel] = useState(false);
  
  const form = useForm<DepartamentoFormValues>({
    resolver: zodResolver(departamentoSchema),
    defaultValues: {
      nome: '',
      responsavelId: '',
    },
  });

  React.useEffect(() => {
    if (departamento) {
      form.reset({
        nome: departamento.nome,
        responsavelId: departamento.responsavelId,
      });
    } else {
      form.reset({
        nome: '',
        responsavelId: '',
      });
    }
  }, [departamento, form, isOpen]);

  const onSubmit = (data: DepartamentoFormValues) => {
    const newDepartamento: Departamento = {
      id: departamento ? departamento.id : `dep-${Date.now()}`,
      nome: data.nome,
      responsavelId: data.responsavelId || '',
    };
    onSave(newDepartamento);
    toast({
      title: `Departamento ${departamento ? 'atualizado' : 'criado'}!`,
      description: `O departamento ${data.nome} foi ${departamento ? 'atualizado' : 'salvo'} com sucesso.`,
      className: "bg-green-100 text-green-800",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{departamento ? "Editar Departamento" : "Adicionar Novo Departamento"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Departamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Tecnologia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsavelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum responsável</SelectItem>
                      {funcionarios.map((func) => (
                        <SelectItem key={func.id} value={func.id}>
                          {func.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
