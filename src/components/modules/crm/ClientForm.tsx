
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useEffect } from "react";
import type { Client } from "./types";
import { ClientFormFields } from "./form/ClientFormFields";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<Client>;
  onSave: (client: Client) => void;
}

export function ClientForm({ open, onClose, initialValues, onSave }: ClientFormProps) {
  const form = useForm<Client>({
    defaultValues: {
      razaoSocial: "",
      nomeFantasia: "",
      cnpj: "",
      endereco: "",
      cidade: "",
      estado: "",
      nomeContato: "",
      email: "",
      telefone: "",
      whatsapp: "",
      status: "Ativo",
      origem: "",
      observacoes: "",
      dataAniversario: undefined,
      // Novo campo para tipo de cliente
      segment: 'standard',
    }
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({ ...initialValues });
    } else {
      form.reset({
        razaoSocial: "",
        nomeFantasia: "",
        cnpj: "",
        endereco: "",
        cidade: "",
        estado: "",
        nomeContato: "",
        email: "",
        telefone: "",
        whatsapp: "",
        status: "Ativo",
        origem: "",
        observacoes: "",
        dataAniversario: undefined,
        segment: 'standard',
      });
    }
  }, [initialValues, open, form]);
  
  function onSubmit(values: Client) {
    const data: Client = {
      ...initialValues,
      ...values,
      id: initialValues?.id ?? Math.random().toString(36).slice(2, 10),
      status: values.status || "Ativo",
      dataCadastro: initialValues?.dataCadastro ?? new Date(),
      historicoCompras: initialValues?.historicoCompras ?? [],
      valorTotalCompras: initialValues?.valorTotalCompras ?? 0,
      dataUltimaCompra: initialValues?.dataUltimaCompra,
      frequenciaCompra: initialValues?.frequenciaCompra,
    };
    onSave(data);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>Preencha e salve as informações deste cliente.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ClientFormFields control={form.control} />
            
            {/* Campo para definir se é cliente, fornecedor ou ambos */}
            <div className="space-y-2">
              <Label htmlFor="clientType">Tipo de Relacionamento</Label>
              <Select 
                value={form.watch('segment') === 'premium' ? 'both' : 'customer'} 
                onValueChange={(value) => {
                  if (value === 'both') {
                    form.setValue('segment', 'premium');
                  } else if (value === 'supplier') {
                    form.setValue('segment', 'basic');
                  } else {
                    form.setValue('segment', 'standard');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Cliente</SelectItem>
                  <SelectItem value="supplier">Fornecedor</SelectItem>
                  <SelectItem value="both">Cliente e Fornecedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="submit" variant="default">Salvar</Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
