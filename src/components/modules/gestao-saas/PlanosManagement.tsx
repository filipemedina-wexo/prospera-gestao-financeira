
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { CreditCard, PlusCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlanosTable } from "./PlanosTable";
import { PlanoDialog } from "./PlanoDialog";
import { Tables } from "@/integrations/supabase/types";

const fetchPlanos = async () => {
    const { data, error } = await supabase.from('saas_plans').select('*').order('name');
    if (error) throw new Error(error.message);
    return data;
};

export function PlanosManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState<Tables<'saas_plans'> | undefined>();

  const { data: planos, isLoading, isError, error } = useQuery<Tables<'saas_plans'>[]>({
    queryKey: ['saas_plans'], 
    queryFn: fetchPlanos
  });

  const handleNew = () => {
    setSelectedPlano(undefined);
    setDialogOpen(true);
  };
  
  const handleEdit = (plano: Tables<'saas_plans'>) => {
    setSelectedPlano(plano);
    setDialogOpen(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      )
    }

    if (isError) {
      return (
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar planos</AlertTitle>
            <AlertDescription>
                {error.message}
            </AlertDescription>
        </Alert>
      )
    }

    return <PlanosTable planos={planos || []} onEdit={handleEdit} />;
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Gestão de Planos
                </CardTitle>
                <CardDescription>Crie e gerencie os planos de assinatura do seu SaaS.</CardDescription>
            </div>
            <Button onClick={handleNew}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Plano
            </Button>
        </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
      </Card>
      <PlanoDialog 
        plano={selectedPlano}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
