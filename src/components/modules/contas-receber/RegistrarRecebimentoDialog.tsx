import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  } from "@/components/ui/alert-dialog";
  import { Button } from "@/components/ui/button";
  import { Calendar } from "@/components/ui/calendar";
  import { Label } from "@/components/ui/label";
  import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
  import { cn } from "@/lib/utils";
  import { format } from "date-fns";
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
  }
  
  export function RegistrarRecebimentoDialog({ open, onOpenChange, onConfirm, conta, bankAccounts }: RegistrarRecebimentoDialogProps) {
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
              Confirme a data e em qual conta o valor de <strong className="text-foreground">{conta?.valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong> foi recebido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="dataPagamento">Data de Recebimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("justify-start text-left font-normal w-full mt-2", !receivedDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {receivedDate ? format(receivedDate, "dd/MM/yyyy") : <span>Selecione a data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={receivedDate} onSelect={setReceivedDate} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="conta">Conta Creditada *</Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                  <SelectTrigger><SelectValue placeholder="Selecione a conta..." /></SelectTrigger>
                  <SelectContent>
                      {bankAccounts.map(account => (
                          <SelectItem key={account.id} value={account.id}>{account.name} ({account.bank_name})</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={!receivedDate || !bankAccountId}>Confirmar Recebimento</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }