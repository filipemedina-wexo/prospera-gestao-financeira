
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tables } from "@/integrations/supabase/types";

interface PlanosTableProps {
  planos: Tables<'saas_plans'>[];
  onEdit: (plano: Tables<'saas_plans'>) => void;
}

const deletePlano = async (id: string) => {
    const { error } = await supabase.from('saas_plans').delete().eq('id', id);
    if (error) {
        throw new Error(error.message);
    }
};

export function PlanosTable({ planos, onEdit }: PlanosTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deletePlano,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['saas_plans'] });
        toast({ title: 'Plano excluído com sucesso!' });
    },
    onError: (error) => {
        toast({ title: 'Erro ao excluir plano', description: error.message, variant: 'destructive' });
    }
  });
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Preço Mensal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planos.length > 0 ? planos.map((plano) => (
            <TableRow key={plano.id}>
              <TableCell className="font-medium">{plano.name}</TableCell>
              <TableCell>
                <Badge variant={
                    plano.type === 'premium' ? 'default' : 
                    plano.type === 'enterprise' ? 'outline' : 'secondary'
                }>
                    {plano.type.charAt(0).toUpperCase() + plano.type.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.monthly_price)}
              </TableCell>
              <TableCell>
                <Badge variant={plano.is_active ? 'default' : 'destructive'}>
                    {plano.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(plano)}>
                  <Edit className="h-4 w-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Essa ação não pode ser desfeita. Isso irá excluir permanentemente o plano.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(plano.id)}>
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
                <TableCell colSpan={5} className="text-center h-24">Nenhum plano encontrado.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
