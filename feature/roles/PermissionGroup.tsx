import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Permission } from "@/types/roles";

interface PermissionGroupProps {
  module: string;
  permissions: Permission[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onToggleAll?: (module: string, ids: number[]) => void;
}

export function PermissionGroup({
  module,
  permissions,
  selectedIds,
  onToggle,
  onToggleAll,
}: PermissionGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  const selectedInGroup = permissions.filter((p) =>
    selectedIds.includes(p.id)
  ).length;
  const totalInGroup = permissions.length;
  const isAllSelected = selectedInGroup === totalInGroup;
  const isIndeterminate = selectedInGroup > 0 && !isAllSelected;

  const handleToggleAll = () => {
    const allIds = permissions.map((p) => p.id);
    if (onToggleAll) {
      onToggleAll(module, allIds);
    } else {
      // Fallback si no se provee onToggleAll
      if (isAllSelected) {
        permissions.forEach((p) => {
          if (selectedIds.includes(p.id)) onToggle(p.id);
        });
      } else {
        permissions.forEach((p) => {
          if (!selectedIds.includes(p.id)) onToggle(p.id);
        });
      }
    }
  };

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card shadow-sm transition-all hover:border-border">
      {/* Cabecera del módulo */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-muted/40 cursor-pointer select-none group"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isIndeterminate ? "indeterminate" : isAllSelected}
            onCheckedChange={handleToggleAll}
            onClick={(e) => e.stopPropagation()}
            className="rounded-[4px] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {module}
          </span>
          {selectedInGroup > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 font-medium bg-primary/10 text-primary border-primary/20">
              {selectedInGroup}/{totalInGroup}
            </Badge>
          )}
        </div>
        <button className="text-muted-foreground group-hover:text-foreground transition-colors p-0.5 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Lista de permisos */}
      {isOpen && (
        <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 bg-background/50 animate-in fade-in slide-in-from-top-1 duration-200">
          {permissions.map((perm) => {
            const isChecked = selectedIds.includes(perm.id);
            return (
              <label
                key={perm.id}
                htmlFor={`perm-${perm.id}`}
                className={`flex items-center gap-2.5 rounded-lg px-2 py-2 cursor-pointer transition-all duration-200 ${
                  isChecked
                    ? "bg-primary/5 hover:bg-primary/10 ring-1 ring-primary/20"
                    : "hover:bg-muted/60"
                }`}
              >
                <Checkbox
                  id={`perm-${perm.id}`}
                  checked={isChecked}
                  onCheckedChange={() => onToggle(perm.id)}
                  className="rounded-[4px] shrink-0"
                />
                <span
                  className={`text-sm leading-snug transition-colors ${
                    isChecked
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {perm.name}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}