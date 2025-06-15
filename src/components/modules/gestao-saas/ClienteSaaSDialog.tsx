
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

const clientSchema = z.object({
  company_name: z.string().min(1, "Nome da empresa é obrigatório"),
  contact_name: z.string().min(1, "Nome do contato é obrigatório"),
  contact_email: z.string().email("Email inválido"),
  contact_phone: z.string().optional(),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  status: z.enum(['active', 'blocked', 'trial', 'suspended']),
});

type ClientFormValues = z.infer<typeof clientSchema>;
type SaasClient = Tables<'saas_clients'>;

interface ClienteSaaSDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  client?: SaasClient;
  onSave: () => void;
}

export function ClienteSaaSDialog({ isOpen, setIsOpen, client, onSave }: ClienteSaaSDialogProps) {
  const { toast } = useToast();
  const isEditing = !!client;

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      cnpj: "",
      address: "",
      city: "",
      state: "",
      status: "trial",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (client) {
        form.reset({
          company_name: client.company_name || "",
          contact_name: client.contact_name || "",
          contact_email: client.contact_email || "",
          contact_phone: client.contact_phone || "",
          cnpj: client.cnpj || "",
          address: client.address || "",
          city: client.city || "",
          state: client.state || "",
          status: client.status || "trial",
        });
      } else {
        form.reset({
          company_name: "",
          contact_name: "",
          contact_email: "",
          contact_phone: "",
          cnpj: "",
          address: "",
          city: "",
          state: "",
          status: "trial",
        });
      }
    }
  }, [isOpen, client, form]);

  async function onSubmit(data: ClientFormValues) {
    try {
      if (isEditing) {
        // Prepare update data with proper typing
        const updateData: TablesUpdate<'saas_clients'> = {
          company_name: data.company_name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone || null,
          cnpj: data.cnpj || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          status: data.status,
        };

        const { error } = await supabase
          .from('saas_clients')
          .update(updateData)
          .eq('id', client.id);

        if (error) throw error;

        toast({
          title: 'Cliente Atualizado',
          description: 'Os dados do cliente foram atualizados com sucesso.',
        });
      } else {
        // Prepare insert data with proper typing
        const insertData: TablesInsert<'saas_clients'> = {
          company_name: data.company_name,
          contact_name: data.contact_name,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone || null,
          cnpj: data.cnpj || null,
          address: data.address || null,
          city: data.city || null,
          state: data.state || null,
          status: data.status,
        };

        const { error } = await supabase
          .from('saas_clients')
          .insert([insertData]);

        if (error) throw error;

        toast({
          title: 'Cliente Adicionado',
          description: 'O novo cliente foi adicionado com sucesso.',
        });
      }

      setIsOpen(false);
      onSave();
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar cliente.',
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente SaaS" : "Adicionar Novo Cliente SaaS"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Contato</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Endereço completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input placeholder="Estado" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                        <SelectItem value="suspended">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
