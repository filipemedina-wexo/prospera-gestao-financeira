
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ClientesHeaderProps {
  onAddClient: () => void;
}

export function ClientesHeader({ onAddClient }: ClientesHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">Clientes SaaS</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie os clientes do sistema SaaS
        </p>
      </div>
      <Button onClick={onAddClient}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Cliente
      </Button>
    </div>
  );
}
