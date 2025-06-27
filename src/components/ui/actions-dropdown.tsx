import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { LucideIcon, MoreVertical, Eye, Edit, Trash2, CheckCircle, X, FileText, Shield, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionItem {
  type: 'view' | 'edit' | 'delete' | 'accept' | 'reject' | 'register' | 'block' | 'activate' | 'custom';
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'success';
  customIcon?: LucideIcon;
}

interface ActionsDropdownProps {
  actions: ActionItem[];
}

const getIconForAction = (type: ActionItem['type'], customIcon?: LucideIcon): LucideIcon => {
  if (customIcon) return customIcon;
  switch (type) {
    case 'view': return Eye;
    case 'edit': return Edit;
    case 'delete': return Trash2;
    case 'accept': return CheckCircle;
    case 'reject': return X;
    case 'register': return FileText;
    case 'block': return Shield;
    case 'activate': return Play;
    default: return Edit;
  }
};

export function ActionsDropdown({ actions }: ActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, idx) => {
          const Icon = getIconForAction(action.type, action.customIcon);
          return (
            <DropdownMenuItem
              key={idx}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                action.variant === 'destructive' && 'text-red-500',
                action.variant === 'success' && 'text-green-600'
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
