
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Plus } from "lucide-react";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { useToast } from "@/hooks/use-toast";
import { bankAccountsService, BankAccount } from "@/services/bankAccountsService";
import { NovaContaBancariaDialog } from "../caixa/NovaContaBancariaDialog";

export const ConfigBancos = () => {
  const { currentClientId } = useMultiTenant();
  const [showDialog, setShowDialog] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<BankAccount | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: bankAccounts = [], isLoading } = useQuery({
    queryKey: ["bank-accounts", currentClientId],
    queryFn: () => currentClientId ? bankAccountsService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const upsertMutation = useMutation({
    mutationFn: async (conta: any): Promise<void> => {
      if (conta.id) {
        await bankAccountsService.update(conta.id, conta);
      } else {
        await bankAccountsService.create(conta);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts", currentClientId] });
      setShowDialog(false);
      setContaParaEditar(null);
      toast({ title: `Conta ${contaParaEditar ? "atualizada" : "criada"} com sucesso!` });
    },
    onError: (error: any) =>
      toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const handleOpenEditDialog = (conta: BankAccount) => {
    setContaParaEditar(conta);
    setShowDialog(true);
  };

  const handleOpenCreateDialog = () => {
    setContaParaEditar(null);
    setShowDialog(true);
  };

  const getTipoContaBadge = (tipo: string) => {
    const tipos: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      corrente: { label: "Corrente", variant: "default" },
      poupanca: { label: "Poupança", variant: "secondary" },
      investimento: { label: "Investimento", variant: "outline" },
    };
    const config = tipos[tipo] || { label: tipo, variant: "outline" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Contas Bancárias
        </CardTitle>
        <CardDescription>Gerencie as contas bancárias da empresa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />Nova Conta
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Saldo Atual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Carregando...</TableCell>
              </TableRow>
            ) : (
              bankAccounts.map((conta) => (
                <TableRow
                  key={conta.id}
                  onClick={() => handleOpenEditDialog(conta)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{conta.name}</TableCell>
                  <TableCell>{conta.bank_name}</TableCell>
                  <TableCell>{getTipoContaBadge(conta.type!)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {Number(conta.balance).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <NovaContaBancariaDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSave={(values) =>
          upsertMutation.mutate({ id: contaParaEditar?.id, ...values })
        }
        contaToEdit={
          contaParaEditar
            ? {
                name: contaParaEditar.name,
                bank_name: contaParaEditar.bank_name,
                initial_balance: contaParaEditar.balance,
                type: contaParaEditar.type as "corrente" | "poupanca" | "investimento",
                agency: contaParaEditar.agency || '',
                account_number: contaParaEditar.account_number || ''
              }
            : null
        }
      />
    </Card>
  );
};
