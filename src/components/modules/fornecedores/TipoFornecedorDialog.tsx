
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const tipoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

type TipoFormData = z.infer<typeof tipoSchema>;

export interface TipoFornecedor {
  id: string;
  nome: string;
}

interface TipoFornecedorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tipo: TipoFornecedor) => void;
  tipo: TipoFornecedor | null;
}

export const TipoFornecedorDialog = ({ open, onOpenChange, onSave, tipo }: TipoFornecedorDialogProps) => {
  const form = useForm<TipoFormData>({
    resolver: zodResolver(tipoSchema),
    defaultValues: {
      nome: '',
    },
  });

  useEffect(() => {
    if (tipo) {
      form.reset({
        nome: tipo.nome,
      });
    } else {
      form.reset({
        nome: '',
      });
    }
  }, [tipo, form, open]);

  const onSubmit = (data: TipoFormData) => {
    onSave({
      id: tipo?.id || Date.now().toString(),
      nome: data.nome,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tipo ? "Editar Tipo" : "Adicionar Tipo"}</DialogTitle>
          <DialogDescription>
            {tipo ? "Edite o tipo de fornecedor." : "Crie um novo tipo de fornecedor."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField 
              control={form.control} 
              name="nome" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Tipo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Produto, Serviço, Material..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
