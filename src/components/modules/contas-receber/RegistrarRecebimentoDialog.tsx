import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { Button } from "@/components/ui/button";
  import { Calendar } from "@/components/ui/calendar";
  import { Label } from "@/components/ui/label";
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { Input } from "@/components/ui/input";
  import { cn } from "@/lib/utils";
  import { Calendar as CalendarIcon } from "lucide-react";
  import { useEffect, useState } from "react";
  import { BankAccount } from "@/services/bankAccountsService";
  import { ContaReceber } from "./types";
  
  interface RegistrarRecebimentoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (data: { receivedDate: Date; bankAccountId: string }) => void;
    conta: ContaReceber | null;
    bankAccounts: BankAccount[];
    isLoading?: boolean;
  }

  export function RegistrarRecebimentoDialog({ open, onOpenChange, onConfirm, conta, bankAccounts, isLoading }: RegistrarRecebimentoDialogProps) {
    const [receivedDate, setReceivedDate] = useState<Date | undefined>(new Date());
    const [bankAccountId, setBankAccountId] = useState<string>("");
  
    useEffect(() => {
      if (open) {
        setReceivedDate(new Date());
        setBankAccountId("");
      }
    }, [open]);
  
    const handleConfirm = () => {
      if (receivedDate && bankAccountId) {
        onConfirm({ receivedDate, bankAccountId });
      }
    };
  
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar Recebimento</AlertDialogTitle>
            <AlertDialogDescription>
              Confirme a data, o valor e a conta creditada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="dataPagamento">Data de Recebimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal w-full mt-2", !receivedDate && "text-muted-foreground")}> 
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {receivedDate ? receivedDate.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={receivedDate} onSelect={setReceivedDate} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="valor">Valor</Label>
              <Input
                id="valor"
                className="w-full mt-2"
                readOnly
                value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta?.valor || 0)}
              />
            </div>
            <div>
              <Label htmlFor="conta">Conta Creditada *</Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                  <SelectTrigger><SelectValue placeholder="Selecione a conta..." /></SelectTrigger>
                  <SelectContent>
                      {(bankAccounts || []).map(account => (
                          <SelectItem key={account.id} value={account.id}>{account.name} {account.bank_name ? `(${account.bank_name})` : ''}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={!receivedDate || !bankAccountId || isLoading}>Confirmar Recebimento</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }