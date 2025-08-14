
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMultiTenant } from "@/contexts/MultiTenantContext";
import { bankAccountsService } from "@/services/bankAccountsService";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface RegistrarPagamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { dataPagamento: Date; bankAccountId: string }) => void;
  conta: { valor: number } | null;
  isLoading?: boolean;
}

export function RegistrarPagamentoDialog({ open, onOpenChange, onConfirm, conta, isLoading }: RegistrarPagamentoDialogProps) {
  const [dataPagamento, setDataPagamento] = useState<Date | undefined>(new Date());
  const [bankAccountId, setBankAccountId] = useState<string | undefined>();
  const { currentClientId } = useMultiTenant();

  const { data: bankAccounts, isLoading: isLoadingBankAccounts } = useQuery({
    queryKey: ['bank-accounts', currentClientId],
    queryFn: () => bankAccountsService.getAll(),
    enabled: !!currentClientId,
  });

  useEffect(() => {
    if (open) {
      setDataPagamento(new Date());
      setBankAccountId(undefined);
    }
  }, [open]);

  const handleConfirm = () => {
    if (dataPagamento && bankAccountId) {
      onConfirm({ dataPagamento, bankAccountId });
    }
  };

  const isConfirmDisabled = !dataPagamento || !bankAccountId || isLoadingBankAccounts || isLoading;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Registrar Pagamento</AlertDialogTitle>
          <AlertDialogDescription>
            Selecione a data e a conta de pagamento para quitar esta despesa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="dataPagamento">Data de Pagamento *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full mt-2",
                    !dataPagamento && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataPagamento ? (
                    format(dataPagamento, "dd/MM/yyyy")
                  ) : (
                    "Selecione a data"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dataPagamento}
                  onSelect={setDataPagamento}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="valor">Valor</Label>
            <Input
              id="valor"
              className="w-full mt-2"
              value={conta?.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? ''}
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="bankAccount">Conta de Pagamento *</Label>
            <Select onValueChange={setBankAccountId} value={bankAccountId}>
              <SelectTrigger id="bankAccount" className="w-full mt-2">
                <SelectValue placeholder={isLoadingBankAccounts ? "Carregando..." : "Selecione a conta"} />
              </SelectTrigger>
              <SelectContent>
                {isLoadingBankAccounts ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : (
                  bankAccounts?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isConfirmDisabled}>
            Confirmar Pagamento
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
