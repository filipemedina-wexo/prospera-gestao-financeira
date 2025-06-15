
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import type { DashboardBlock } from "@/types/dashboardBlock";
import { Button } from "@/components/ui/button";
import { GripVertical, ChevronLeft, ChevronRight } from "lucide-react";

// Sortable Block Wrapper
function SortableBlock({
  block,
  index,
  resizeBlock,
  isEditMode,
  children,
}: {
  block: DashboardBlock;
  index: number;
  resizeBlock: (id: string, dir: "inc" | "dec") => void;
  isEditMode: boolean;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    gridColumn: `span ${block.cols} / span ${block.cols}`,
    minWidth: 0,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isEditMode && (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1 bg-white/70 rounded">
          <button {...listeners} {...attributes} className="cursor-move p-1" tabIndex={-1}>
            <GripVertical className="w-4 h-4" />
          </button>
          <button
            className="p-1"
            tabIndex={-1}
            aria-label="Diminuir tamanho"
            onClick={() => resizeBlock(block.id, "dec")}
            disabled={block.cols <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            className="p-1"
            tabIndex={-1}
            aria-label="Aumentar tamanho"
            onClick={() => resizeBlock(block.id, "inc")}
            disabled={block.cols >= 4}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}

// Main grid component
export function DashboardBlocks({
  blocks,
  setBlocks,
  isEditMode,
}: {
  blocks: DashboardBlock[];
  setBlocks: ((blocks: DashboardBlock[]) => void) | ((updater: (blocks: DashboardBlock[]) => DashboardBlock[]) => void);
  isEditMode: boolean;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIdx = blocks.findIndex(b => b.id === active.id);
      const newIdx = blocks.findIndex(b => b.id === over?.id);
      // Use updater function form when calling setBlocks
      (setBlocks as (updater: (blocks: DashboardBlock[]) => DashboardBlock[]) => void)(
        (currentBlocks) => arrayMove(currentBlocks, oldIdx, newIdx)
      );
    }
  };

  const resizeBlock = (id: string, dir: "inc" | "dec") => {
    // Use updater function form when calling setBlocks
    (setBlocks as (updater: (blocks: DashboardBlock[]) => DashboardBlock[]) => void)(
      blocks =>
        blocks.map(b =>
          b.id === id
            ? { ...b, cols: dir === "inc" ? Math.min(4, b.cols + 1) : Math.max(1, b.cols - 1) }
            : b
        )
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={blocks.map(b => b.id)} strategy={rectSortingStrategy}>
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-2">
          {blocks.map((block, idx) => (
            <SortableBlock
              key={block.id}
              block={block}
              index={idx}
              resizeBlock={resizeBlock}
              isEditMode={isEditMode}
            >
              <block.component {...(block.props || {})} />
            </SortableBlock>
          ))}
        </section>
      </SortableContext>
    </DndContext>
  );
}
