
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface Column {
  key: string;
  label: string;
  visible: boolean;
}

interface Props {
  columns: Column[];
  setColumns: (cols: Column[]) => void;
  filters: Record<string, string>;
  setFilters: (f: Record<string, string>) => void;
}

export function ColumnSettingsMenu({ columns, setColumns }: Props) {
  const [open, setOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  // Troca de posições simples via drag & drop
  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }
  function handleDragOver(idx: number) {
    if (dragIdx === null || dragIdx === idx) return;
    const newCols = [...columns];
    const [removed] = newCols.splice(dragIdx, 1);
    newCols.splice(idx, 0, removed);
    setColumns(newCols);
    setDragIdx(idx);
  }

  function toggleVisible(idx: number) {
    const newCols = [...columns];
    newCols[idx].visible = !newCols[idx].visible;
    setColumns(newCols);
  }
  function resetOrder() {
    // Ordem padrão
    setColumns([
      { key: "razaoSocial", label: "Razão Social", visible: true },
      { key: "nomeFantasia", label: "Apelido/Fantasia", visible: true },
      { key: "cnpj", label: "CNPJ", visible: true },
      { key: "nomeContato", label: "Contato", visible: true },
      { key: "telefone", label: "Telefone", visible: true },
      { key: "whatsapp", label: "WhatsApp", visible: true },
      { key: "cidade", label: "Cidade", visible: true },
      { key: "estado", label: "Estado", visible: true },
      { key: "status", label: "Status", visible: true }
    ]);
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(v => !v)}
        type="button"
        aria-label="Configurar Colunas"
        className="flex items-center"
      >
        <Filter className="w-4 h-4" />
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 bg-popover border rounded shadow p-4 text-sm space-y-2">
          <div className="font-semibold mb-2">Colunas</div>
          <ul>
            {columns.map((col, idx) => (
              <li
                className="flex items-center justify-between px-2 py-1 mb-1 bg-accent rounded cursor-move"
                draggable
                key={col.key}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => toggleVisible(idx)}
                    className="mr-2"
                    id={`col_${col.key}`}
                  />
                  <label htmlFor={`col_${col.key}`}>{col.label}</label>
                </div>
                <span className="cursor-grab" title="Arraste para reordenar">☰</span>
              </li>
            ))}
          </ul>
          <Button size="sm" variant="ghost" className="w-full" onClick={resetOrder}>
            Resetar ordem e visão
          </Button>
        </div>
      )}
    </div>
  );
}
