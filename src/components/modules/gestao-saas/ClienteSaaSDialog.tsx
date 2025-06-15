
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { clientSchema, ClientFormValues } from './clienteSchema';
import { ClienteForm } from './ClienteForm';

type SaasClient = Tables<'saas_clients'>;

interface ClienteSaaSDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  client?: SaasClient | null;
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
      if (isEditing && client) {
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
            <ClienteForm form={form} />
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
