
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlarmClock, HandCoins, CheckCircle2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert } from "@/types/alert";
import { format } from "date-fns";

type AlertsPopupProps = {
  open: boolean;
  alerts: Alert[];
  onClose: () => void;
  onResolve: (id: string) => void;
  onViewDetails: (alert: Alert) => void;
};

function getTypeBadge(type: Alert["type"]) {
  switch (type) {
    case "Atrasado":
      return <Badge variant="destructive" className="text-xs mr-2">Atrasado</Badge>;
    case "Vencendo hoje":
      return <Badge variant="secondary" className="text-xs mr-2">Vence Hoje</Badge>;
    case "A Receber":
      return <Badge variant="outline" className="text-xs mr-2">A Receber</Badge>;
    default:
      return null;
  }
}

function getTypeIcon(type: Alert["type"]) {
  switch (type) {
    case "Atrasado":
      return <AlertTriangle className="text-red-600 w-5 h-5 mr-2" />;
    case "Vencendo hoje":
      return <AlarmClock className="text-orange-500 w-5 h-5 mr-2" />;
    case "A Receber":
      return <HandCoins className="text-blue-600 w-5 h-5 mr-2" />;
    default:
      return <DollarSign className="text-gray-600 w-5 h-5 mr-2" />;
  }
}

function getPriorityColor(type: Alert["type"]) {
  switch (type) {
    case "Atrasado":
      return "border-red-300 bg-red-50";
    case "Vencendo hoje":
      return "border-orange-200 bg-orange-50";
    case "A Receber":
      return "border-blue-200 bg-blue-50";
    default:
      return "border-gray-200 bg-gray-50";
  }
}

export function AlertsPopup({
  open,
  alerts,
  onClose,
  onResolve,
  onViewDetails,
}: AlertsPopupProps) {
  // Filter resolved out and sort by priority
  const unresolvedAlerts = alerts
    .filter(a => !a.resolved)
    .sort((a, b) => {
      const priorityOrder = { "Atrasado": 1, "Vencendo hoje": 2, "A Receber": 3 };
      return (priorityOrder[a.type] || 4) - (priorityOrder[b.type] || 4);
    });

  const grouped = {
    atrasados: unresolvedAlerts.filter(a => a.type === "Atrasado"),
    vencendoHoje: unresolvedAlerts.filter(a => a.type === "Vencendo hoje"),
    aReceber: unresolvedAlerts.filter(a => a.type === "A Receber"),
  };

  const totalAmount = unresolvedAlerts.reduce((sum, alert) => sum + alert.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas Financeiros
          </DialogTitle>
          <DialogDescription>
            {unresolvedAlerts.length} alerta(s) exigindo atenção - Total: {' '}
            <span className="font-semibold text-red-600">
              {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto space-y-4">
          {unresolvedAlerts.length === 0 ? (
            <div className="w-full text-center text-muted-foreground py-10">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium">Tudo em dia!</h3>
              <p className="text-sm">Não há alertas críticos no momento.</p>
            </div>
          ) : (
            <>
              {/* Atrasados - Prioridade alta */}
              {grouped.atrasados.length > 0 && (
                <div>
                  <h4 className="text-base font-bold mb-3 text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Contas Atrasadas ({grouped.atrasados.length})
                  </h4>
                  <div className="space-y-2">
                    {grouped.atrasados.map(alert => (
                      <AlertItem 
                        key={alert.id}
                        alert={alert}
                        onResolve={onResolve}
                        onViewDetails={onViewDetails}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Vencendo hoje - Prioridade média */}
              {grouped.vencendoHoje.length > 0 && (
                <div>
                  <h4 className="text-base font-bold mb-3 text-orange-500 flex items-center gap-2">
                    <AlarmClock className="h-4 w-4" />
                    Vencendo Hoje ({grouped.vencendoHoje.length})
                  </h4>
                  <div className="space-y-2">
                    {grouped.vencendoHoje.map(alert => (
                      <AlertItem 
                        key={alert.id}
                        alert={alert}
                        onResolve={onResolve}
                        onViewDetails={onViewDetails}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* A receber - Prioridade baixa */}
              {grouped.aReceber.length > 0 && (
                <div>
                  <h4 className="text-base font-bold mb-3 text-blue-600 flex items-center gap-2">
                    <HandCoins className="h-4 w-4" />
                    A Receber ({grouped.aReceber.length})
                  </h4>
                  <div className="space-y-2">
                    {grouped.aReceber.map(alert => (
                      <AlertItem 
                        key={alert.id}
                        alert={alert}
                        onResolve={onResolve}
                        onViewDetails={onViewDetails}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        <DialogFooter className="flex-shrink-0">
          <div className="flex justify-between items-center w-full">
            <span className="text-sm text-muted-foreground">
              {unresolvedAlerts.length > 0 && `${unresolvedAlerts.length} itens pendentes`}
            </span>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AlertItem({
  alert,
  onResolve,
  onViewDetails,
}: {
  alert: Alert;
  onResolve: (id: string) => void;
  onViewDetails: (alert: Alert) => void;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50",
      getPriorityColor(alert.type)
    )}>
      <div className="flex items-start gap-3 flex-1">
        {getTypeIcon(alert.type)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getTypeBadge(alert.type)}
            <span className="font-medium text-gray-900 truncate">{alert.title}</span>
          </div>
          <div className="text-sm text-gray-600 mb-1">{alert.description}</div>
          {alert.dueDate && (
            <div className="text-xs text-gray-500">
              Vencimento: {format(new Date(alert.dueDate), "dd/MM/yyyy")}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2 ml-4">
        <span className={cn(
          "font-bold text-lg",
          alert.type === "Atrasado" && "text-red-600",
          alert.type === "Vencendo hoje" && "text-orange-600",
          alert.type === "A Receber" && "text-blue-600"
        )}>
          {alert.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </span>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onViewDetails(alert)}
            className="text-xs"
          >
            Ver detalhes
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onResolve(alert.id)}
            className="text-xs"
          >
            Resolver
          </Button>
        </div>
      </div>
    </div>
  );
}
