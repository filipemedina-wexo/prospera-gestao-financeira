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
import { AlertTriangle, AlarmClock, HandCoins, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert } from "@/types/alert";

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
      return null;
  }
}

export function AlertsPopup({
  open,
  alerts,
  onClose,
  onResolve,
  onViewDetails,
}: AlertsPopupProps) {
  // Filter resolved out
  const unresolvedAlerts = alerts.filter(a => !a.resolved);

  const grouped = {
    atrasados: unresolvedAlerts.filter(a => a.type === "Atrasado"),
    vencendoHoje: unresolvedAlerts.filter(a => a.type === "Vencendo hoje"),
    aReceber: unresolvedAlerts.filter(a => a.type === "A Receber"),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Alertas Recentes</DialogTitle>
          <DialogDescription>
            Veja detalhes das contas que exigem atenção.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[380px] overflow-auto">
          {Object.entries(grouped).every(([, arr]) => arr.length === 0) && (
            <div className="w-full text-center text-muted-foreground py-10">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
              Sem alertas críticos no momento!
            </div>
          )}
          {/* Render groups - Atrasados first, depois Vencendo hoje, depois A Receber */}
          {grouped.atrasados.length > 0 && (
            <div>
              <h4 className="text-base font-bold mb-2 text-red-600">Atrasados</h4>
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
          {grouped.vencendoHoje.length > 0 && (
            <div>
              <h4 className="text-base font-bold mb-2 text-orange-500 mt-2">Vencendo hoje</h4>
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
          {grouped.aReceber.length > 0 && (
            <div>
              <h4 className="text-base font-bold mb-2 text-blue-600 mt-2">A Receber</h4>
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Fechar</Button>
          </DialogClose>
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
      "flex items-center justify-between rounded border p-3 bg-white",
      alert.type === "Atrasado" ? "border-red-300" : 
      alert.type === "Vencendo hoje" ? "border-orange-200" : "border-blue-200"
    )}>
      <div className="flex items-center">
        {getTypeIcon(alert.type)}
        <div>
          <div className="flex items-center">
            {getTypeBadge(alert.type)}
            <span className="font-medium">{alert.title}</span>
          </div>
          <div className="text-xs text-muted-foreground">{alert.description}</div>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-1 min-w-[120px]">
        <span 
          className={cn(
            "font-bold",
            alert.type === "Atrasado" && "text-red-600",
            alert.type === "Vencendo hoje" && "text-orange-500",
            alert.type === "A Receber" && "text-blue-600"
          )}
        >
          R$ {alert.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onViewDetails(alert)}
          >
            Ver detalhes
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onResolve(alert.id)}
          >
            Resolver
          </Button>
        </div>
      </div>
    </div>
  );
}
