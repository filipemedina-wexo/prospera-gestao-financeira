
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Cargo, Departamento, Funcionario } from "./types";
import { useToast } from "@/hooks/use-toast";

const funcionarioSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  departamento: z.string({ required_error: "Por favor, selecione um departamento." }).min(1, { message: "Por favor, selecione um departamento." }),
  cargo: z.string({ required_error: "Por favor, selecione um cargo." }).min(1, { message: "Por favor, selecione um cargo." }),
  dataAdmissao: z.date({ required_error: "A data de admissão é obrigatória." }),
  salario: z.coerce.number().positive({ message: "O salário deve ser um número positivo." }),
  status: z.enum(["ativo", "inativo", "ferias"], { required_error: "Por favor, selecione um status." }),
});

export type FuncionarioFormValues = z.infer<typeof funcionarioSchema>;

interface FuncionarioDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (data: Funcionario) => void;
  funcionario: Funcionario | null;
  departamentos: Departamento[];
  cargos: Cargo[];
}

export function FuncionarioDialog({ isOpen, setIsOpen, onSave, funcionario, departamentos, cargos }: FuncionarioDialogProps) {
  const { toast } = useToast();
  const form = useForm<FuncionarioFormValues>({
    resolver: zodResolver(funcionarioSchema),
    defaultValues: {
        nome: '',
        email: '',
        departamento: '',
        cargo: '',
        dataAdmissao: new Date(),
        salario: 0,
        status: 'ativo',
    },
  });

  React.useEffect(() => {
    if (funcionario) {
      form.reset({
        nome: funcionario.nome,
        email: funcionario.email,
        departamento: funcionario.departamento,
        cargo: funcionario.cargo,
        dataAdmissao: new Date(funcionario.dataAdmissao),
        salario: funcionario.salario,
        status: funcionario.status,
      });
    } else {
      form.reset({
        nome: '',
        email: '',
        departamento: '',
        cargo: '',
        dataAdmissao: new Date(),
        salario: 0,
        status: 'ativo',
      });
    }
  }, [funcionario, form, isOpen]);

  const onSubmit = (data: FuncionarioFormValues) => {
    const newFuncionario: Funcionario = {
      id: funcionario ? funcionario.id : `func-${Date.now()}`,
      nome: data.nome,
      email: data.email,
      departamento: data.departamento,
      cargo: data.cargo,
      dataAdmissao: data.dataAdmissao,
      salario: data.salario,
      status: data.status,
    };
    onSave(newFuncionario);
    toast({
      title: `Colaborador ${funcionario ? 'atualizado' : 'criado'}!`,
      description: `O colaborador ${data.nome} foi ${funcionario ? 'atualizado' : 'salvo'} com sucesso.`,
      className: "bg-green-100 text-green-800",
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{funcionario ? "Editar Colaborador" : "Adicionar Novo Colaborador"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ex: joao.silva@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departamentos.map((dep) => (
                          <SelectItem key={dep.id} value={dep.nome}>
                            {dep.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cargos.map((cargo) => (
                          <SelectItem key={cargo.id} value={cargo.nome}>
                            {cargo.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataAdmissao"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Data de Admissão</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salário (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 5000.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="ferias">Férias</SelectItem>
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
