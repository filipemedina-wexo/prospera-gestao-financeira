
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar as LucideCalendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ExtratoPeriodoSelectorProps {
  extratoPeriodoInicio: Date | undefined;
  extratoPeriodoFim: Date | undefined;
  setExtratoPeriodoInicio: (d: Date | undefined) => void;
  setExtratoPeriodoFim: (d: Date | undefined) => void;
}

export const ExtratoPeriodoSelector: React.FC<ExtratoPeriodoSelectorProps> = ({
  extratoPeriodoInicio,
  extratoPeriodoFim,
  setExtratoPeriodoInicio,
  setExtratoPeriodoFim,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b">
      <div>
        <span className="font-medium text-sm">Período:</span>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-40 justify-start text-left font-normal",
              !extratoPeriodoInicio && "text-muted-foreground"
            )}
          >
            <LucideCalendar className="mr-2 h-4 w-4" />
            {extratoPeriodoInicio
              ? format(extratoPeriodoInicio, "dd/MM/yyyy")
              : <span>Data inicial</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <ShadcnCalendar
            mode="single"
            selected={extratoPeriodoInicio}
            onSelect={setExtratoPeriodoInicio}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            disabled={
              (date) => extratoPeriodoFim && date > extratoPeriodoFim
            }
          />
        </PopoverContent>
      </Popover>
      <span>até</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-40 justify-start text-left font-normal",
              !extratoPeriodoFim && "text-muted-foreground"
            )}
          >
            <LucideCalendar className="mr-2 h-4 w-4" />
            {extratoPeriodoFim
              ? format(extratoPeriodoFim, "dd/MM/yyyy")
              : <span>Data final</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <ShadcnCalendar
            mode="single"
            selected={extratoPeriodoFim}
            onSelect={setExtratoPeriodoFim}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
            disabled={
              (date) => extratoPeriodoInicio && date < extratoPeriodoInicio
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
