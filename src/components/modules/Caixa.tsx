
import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { NovaContaBancariaDialog } from "./caixa/NovaContaBancariaDialog";
import { TransactionHistory } from "./caixa/TransactionHistory";
import { useToast } from "@/hooks/use-toast";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { bankAccountsService, BankAccount } from "@/services/bankAccountsService";
import { financialTransactionsService } from "@/services/financialTransactionsService";
import { Skeleton } from "@/components/ui/skeleton";

export function Caixa() {
  const { toast } = useToast();
  const { currentClientId } = useMultiTenant();
  const queryClient = useQueryClient();
  
  const [showNovaContaDialog, setShowNovaContaDialog] = useState(false);
  const [contaParaEditar, setContaParaEditar] = useState<BankAccount | null>(null);

  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ['bank-accounts', currentClientId],
    queryFn: () => currentClientId ? bankAccountsService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const { data: transactions } = useQuery({
    queryKey: ['financial-transactions', currentClientId],
    queryFn: () => currentClientId ? financialTransactionsService.getAll() : Promise.resolve([]),
    enabled: !!currentClientId,
  });

  const { mutate: createBankAccount } = useMutation({
    mutationFn: (account: Parameters<typeof bankAccountsService.create>[0]) => 
      bankAccountsService.create(account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', currentClientId] });
      setShowNovaContaDialog(false);
      setContaParaEditar(null);
      toast({ title: 'Conta bancária criada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const { mutate: updateBankAccount } = useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Parameters<typeof bankAccountsService.update>[1]) => 
      bankAccountsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', currentClientId] });
      setShowNovaContaDialog(false);
      setContaParaEditar(null);
      toast({ title: 'Conta bancária atualizada com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const handleSaveAccount = (values: any) => {
    if (contaParaEditar) {
      updateBankAccount({ id: contaParaEditar.id, ...values });
    } else {
      createBankAccount(values);
    }
  };

  const handleEditAccount = (account: BankAccount) => {
    setContaParaEditar(account);
    setShowNovaContaDialog(true);
  };

  // Calculate summary statistics
  const totalBalance = bankAccounts?.reduce((sum, account) => sum + account.balance, 0) || 0;
  const totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Caixa</h2>
          <p className="text-muted-foreground">Controle suas contas bancárias e fluxo de caixa</p>
        </div>
        <Button onClick={() => { setContaParaEditar(null); setShowNovaContaDialog(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta Bancária
        </Button>
      </div>

      <NovaContaBancariaDialog
        open={showNovaContaDialog}
        onOpenChange={setShowNovaContaDialog}
        onSave={handleSaveAccount}
        contaToEdit={contaParaEditar}
      />

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas Bancárias</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {bankAccounts?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
          <TabsTrigger value="transactions">Histórico de Transações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Contas Bancárias</CardTitle>
              <CardDescription>
                Gerencie suas contas bancárias e monitore os saldos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : !bankAccounts || bankAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma conta bancária cadastrada.</p>
                  <Button 
                    className="mt-2" 
                    onClick={() => { setContaParaEditar(null); setShowNovaContaDialog(true); }}
                  >
                    Cadastrar Primeira Conta
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bankAccounts.map((account) => (
                    <Card key={account.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditAccount(account)}>
                      <CardHeader>
                        <CardTitle className="text-lg">{account.name}</CardTitle>
                        <CardDescription>{account.bank_name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {account.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          {account.type && `Tipo: ${account.type}`}
                        </div>
                        {account.agency && account.account_number && (
                          <div className="text-sm text-muted-foreground">
                            Ag: {account.agency} - CC: {account.account_number}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
