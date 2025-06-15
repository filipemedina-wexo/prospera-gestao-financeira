
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Fornecedor } from "./types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const fornecedorSchema = z.object({
  razaoSocial: z.string().min(3, "Razão social é obrigatória"),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ inválido (mínimo 14 caracteres)").max(18, "CNPJ inválido (máximo 18 caracteres)"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  status: z.enum(["Ativo", "Inativo"]),
  tipo: z.enum(["Produto", "Serviço", "Ambos"]),
  chavePix: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  nomeContato: z.string().optional(),
  observacoes: z.string().optional(),
  condicaoPagamento: z.string().optional(),
  proximoPagamento: z.string().optional(),
  valorProximoPagamento: z.preprocess(
    (val) => (String(val).trim() === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: "Valor inválido" }).optional()
  ),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

interface FornecedorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (fornecedor: Fornecedor) => void;
  fornecedor: Fornecedor | null;
}

export const FornecedorDialog = ({ open, onOpenChange, onSave, fornecedor }: FornecedorDialogProps) => {
  const form = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      email: '',
      telefone: '',
      status: 'Ativo',
      tipo: 'Produto',
      chavePix: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      nomeContato: '',
      observacoes: '',
      condicaoPagamento: '',
      proximoPagamento: '',
      valorProximoPagamento: undefined,
    },
  });

  useEffect(() => {
    if (fornecedor) {
      form.reset({
        ...fornecedor,
        proximoPagamento: fornecedor.proximoPagamento ? format(new Date(fornecedor.proximoPagamento), 'yyyy-MM-dd') : '',
        valorProximoPagamento: fornecedor.valorProximoPagamento ?? undefined,
      });
    } else {
      form.reset({
        razaoSocial: '',
        nomeFantasia: '',
        cnpj: '',
        email: '',
        telefone: '',
        status: 'Ativo',
        tipo: 'Produto',
        chavePix: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        nomeContato: '',
        observacoes: '',
        condicaoPagamento: '',
        proximoPagamento: '',
        valorProximoPagamento: undefined,
      });
    }
  }, [fornecedor, form, open]);

  const onSubmit = (data: FornecedorFormData) => {
    onSave({
      id: fornecedor?.id || Date.now().toString(),
      dataCadastro: fornecedor?.dataCadastro || new Date(),
      razaoSocial: data.razaoSocial,
      nomeFantasia: data.nomeFantasia,
      cnpj: data.cnpj,
      email: data.email,
      telefone: data.telefone,
      status: data.status,
      tipo: data.tipo,
      chavePix: data.chavePix,
      endereco: data.endereco,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep,
      nomeContato: data.nomeContato,
      observacoes: data.observacoes,
      condicaoPagamento: data.condicaoPagamento,
      proximoPagamento: data.proximoPagamento ? new Date(`${data.proximoPagamento}T00:00:00`) : undefined,
      valorProximoPagamento: data.valorProximoPagamento,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{fornecedor ? "Editar Fornecedor" : "Adicionar Fornecedor"}</DialogTitle>
          <DialogDescription>
            {fornecedor ? "Edite as informações do fornecedor." : "Preencha as informações do novo fornecedor."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="razaoSocial" render={({ field }) => ( <FormItem><FormLabel>Razão Social</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="nomeFantasia" render={({ field }) => ( <FormItem><FormLabel>Nome Fantasia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="cnpj" render={({ field }) => ( <FormItem><FormLabel>CNPJ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="telefone" render={({ field }) => ( <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="nomeContato" render={({ field }) => ( <FormItem><FormLabel>Nome do Contato</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Ativo">Ativo</SelectItem><SelectItem value="Inativo">Inativo</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="tipo" render={({ field }) => ( <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Produto">Produto</SelectItem><SelectItem value="Serviço">Serviço</SelectItem><SelectItem value="Ambos">Ambos</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="chavePix" render={({ field }) => ( <FormItem><FormLabel>Chave PIX</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="cep" render={({ field }) => ( <FormItem><FormLabel>CEP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="endereco" render={({ field }) => ( <FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="cidade" render={({ field }) => ( <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="estado" render={({ field }) => ( <FormItem><FormLabel>Estado</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <div>
              <h3 className="text-lg font-medium border-b pb-2 my-4">Informações Financeiras</h3>
              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="condicaoPagamento" render={({ field }) => ( <FormItem><FormLabel>Cond. Pagamento</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="proximoPagamento" render={({ field }) => ( <FormItem><FormLabel>Próximo Pagamento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="valorProximoPagamento" render={({ field }) => ( <FormItem><FormLabel>Valor</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value)} placeholder="R$ 0,00" /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </div>

            <FormField control={form.control} name="observacoes" render={({ field }) => ( <FormItem><FormLabel>Observações</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            
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
