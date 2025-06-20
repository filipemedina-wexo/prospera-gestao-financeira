import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Wallet, Building2, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { useToast } from "@/hooks/use-toast";
import { bankAccountsService, BankAccount } from "@/services/bankAccountsService";
import { NovaContaBancariaDialog } from "./caixa/NovaContaBancariaDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function Caixa() {
  const [showContaDialog, setShowContaDialog] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<BankAccount | null>(null);
  const { currentClientId } = useMultiTenant();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: bankAccounts = [], isLoading } = useQuery({
    queryKey: ['bank-accounts', currentClientId],
    queryFn: () => bankAccountsService.getAll(),
    enabled: !!currentClientId,
  });

  const upsertMutation = useMutation({
    mutationFn: (conta: any) => conta.id ? bankAccountsService.update(conta.id, conta) : bankAccountsService.create(conta),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['bank-accounts', currentClientId] });
        setShowContaDialog(false);
        setContaParaEditar(null);
        toast({ title: `Conta ${contaParaEditar ? 'atualizada' : 'criada'} com sucesso!` });
    },
    onError: (error: any) => toast({ title: 'Erro', description: error.message, variant: 'destructive' })
  });

  const summary = useMemo(() => ({
    saldoTotal: bankAccounts.reduce((sum, conta) => sum + Number(conta.balance), 0),
    totalContas: bankAccounts.length,
  }), [bankAccounts]);

  const handleOpenEditDialog = (conta: BankAccount) => {
    setContaParaEditar(conta);
    setShowContaDialog(true);
  };
  
  const handleOpenCreateDialog = () => {
    setContaParaEditar(null);
    setShowContaDialog(true);
  };

  const getTipoContaBadge = (tipo: string) => {
    const tipos: Record<string, {label: string, variant: "default" | "secondary" | "outline"}> = {
      corrente: { label: "Corrente", variant: "default" },
      poupanca: { label: "Poupança", variant: "secondary" },
      investimento: { label: "Investimento", variant: "outline" }
    };
    const config = tipos[tipo] || { label: tipo, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Controle de Caixa</h2>
          <p className="text-muted-foreground">Gerencie suas contas bancárias</p>
        </div>
        <Button onClick={handleOpenCreateDialog}><Plus className="h-4 w-4 mr-2" />Nova Conta Bancária</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Saldo Total Consolidado</CardTitle><Wallet className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{summary.saldoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Contas Ativas</CardTitle><Building2 className="h-4 w-4 text-muted-foreground" /></CardHeader>
          <CardContent><div className="text-2xl font-bold">{summary.totalContas}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Contas Bancárias Cadastradas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nome da Conta</TableHead><TableHead>Banco</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Saldo Atual</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={4} className="text-center"><Skeleton className="h-20 w-full" /></TableCell></TableRow> : 
              bankAccounts.map((conta) => (
                <TableRow key={conta.id} onClick={() => handleOpenEditDialog(conta)} className="cursor-pointer">
                  <TableCell className="font-medium">{conta.name}</TableCell>
                  <TableCell>{conta.bank_name}</TableCell>
                  <TableCell>{getTipoContaBadge(conta.type!)}</TableCell>
                  <TableCell className="text-right font-semibold">{Number(conta.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <NovaContaBancariaDialog 
        open={showContaDialog}
        onOpenChange={setShowContaDialog}
        onSave={(values) => upsertMutation.mutate({id: contaParaEditar?.id, ...values, initial_balance: values.balance})} // Renomeando de volta para o schema
        contaToEdit={contaParaEditar ? {...contaParaEditar, initial_balance: contaParaEditar.balance} : null} // Renomeando para o form
      />
    </div>
  );
}