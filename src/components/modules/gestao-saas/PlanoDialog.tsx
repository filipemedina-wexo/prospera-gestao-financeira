
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { PlanoForm } from "./PlanoForm";
import { planSchema, PlanFormValues } from "./planoSchema";
import { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

interface PlanoDialogProps {
  plano?: Tables<'saas_plans'>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const upsertPlano = async (values: TablesInsert<'saas_plans'> | TablesUpdate<'saas_plans'>) => {
  const { id, ...updateData } = values;
  let response;
  if (id) {
    response = await supabase.from('saas_plans').update(updateData).eq('id', id as string).select().single();
  } else {
    response = await supabase.from('saas_plans').insert(updateData as TablesInsert<'saas_plans'>).select().single();
  }
  
  if (response.error) {
    console.error('Error upserting plan:', response.error);
    throw new Error(response.error.message);
  }
  return response.data;
};


export function PlanoDialog({ plano, open, onOpenChange }: PlanoDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
  });

  useEffect(() => {
    if (open) {
        if (plano) {
            form.reset({
                ...plano,
                yearly_price: plano.yearly_price ?? null,
                features: Array.isArray(plano.features) ? plano.features.join(', ') : '',
            });
        } else {
            form.reset({
                name: '',
                description: '',
                type: 'basic',
                monthly_price: 0,
                yearly_price: null,
                max_users: 1,
                features: '',
                is_active: true,
            });
        }
    }
  }, [plano, open, form]);
  
  const mutation = useMutation({
    mutationFn: upsertPlano,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saas_plans'] });
      toast({ title: `Plano ${plano ? 'atualizado' : 'criado'} com sucesso!` });
      onOpenChange?.(false);
    },
    onError: (error) => {
      toast({ title: `Erro ao ${plano ? 'atualizar' : 'criar'} plano`, description: error.message, variant: 'destructive' });
    }
  });

  const onSubmit = (values: PlanFormValues) => {
    const { features, ...rest } = values;
    const featuresArray = features ? features.split(',').map(f => f.trim()).filter(Boolean) : [];
    
    const dataToSubmit = {
      ...rest,
      id: plano?.id,
      features: featuresArray
    }
    
    mutation.mutate(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plano ? 'Editar Plano' : 'Criar Novo Plano'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PlanoForm form={form} />
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)} type="button">Cancelar</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
