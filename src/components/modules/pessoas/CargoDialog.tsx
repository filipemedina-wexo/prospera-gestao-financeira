
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
import { Textarea } from "@/components/ui/textarea";
import { Cargo } from "./types";
import { useToast } from "@/hooks/use-toast";

const cargoSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  descricao: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres." }),
});

export type CargoFormValues = z.infer<typeof cargoSchema>;

interface CargoDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (data: Cargo) => void;
  cargo: Cargo | null;
}

export function CargoDialog({ isOpen, setIsOpen, onSave, cargo }: CargoDialogProps) {
  const { toast } = useToast();
  const form = useForm<CargoFormValues>({
    resolver: zodResolver(cargoSchema),
    defaultValues: {
      nome: '',
      descricao: '',
    },
  });

  React.useEffect(() => {
    if (cargo) {
      form.reset({
        nome: cargo.nome,
        descricao: cargo.descricao,
      });
    } else {
      form.reset({
        nome: '',
        descricao: '',
      });
    }
  }, [cargo, form, isOpen]);

  const onSubmit = (data: CargoFormValues) => {
    const newCargo: Cargo = {
      id: cargo ? cargo.id : `cargo-${Date.now()}`,
      nome: data.nome,
      descricao: data.descricao,
    };
    onSave(newCargo);
    toast({
      title: `Cargo ${cargo ? 'atualizado' : 'criado'}!`,
      description: `O cargo ${data.nome} foi ${cargo ? 'atualizado' : 'salvo'} com sucesso.`,
      className: "bg-green-100 text-green-800",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{cargo ? "Editar Cargo" : "Adicionar Novo Cargo"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Desenvolvedor Full-Stack" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva as responsabilidades do cargo..." {...field} />
                  </FormControl>
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
