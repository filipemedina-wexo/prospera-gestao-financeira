
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMultiTenant } from '@/contexts/MultiTenantContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const assignmentSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  role: z.string().min(1, 'Selecione um papel'),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface ClientAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function ClientAssignmentDialog({ isOpen, onClose, userId, userName }: ClientAssignmentDialogProps) {
  const { toast } = useToast();
  const { assignUserToClient } = useMultiTenant();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      clientId: '',
      role: 'user',
    },
  });

  const { data: clients } = useQuery({
    queryKey: ['saas-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saas_clients')
        .select('id, company_name')
        .eq('status', 'active')
        .order('company_name');

      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (values: AssignmentFormValues) => {
    setIsLoading(true);
    try {
      await assignUserToClient(values.clientId, values.role);
      toast({
        title: 'Usuário Associado',
        description: `${userName} foi associado ao cliente com sucesso.`,
      });
      onClose();
      form.reset();
    } catch (error) {
      console.error('Error assigning user to client:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao associar usuário ao cliente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Associar Usuário ao Cliente</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Papel</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um papel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Associando...' : 'Associar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
