"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/roles";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Role, Permission } from "@/types/roles";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useMemo, useState } from "react";
import { Search, Shield } from "lucide-react";
import { PermissionGroup } from "./PermissionGroup"

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  permissions: z.array(z.number()),
});

type FormValues = z.infer<typeof formSchema>;

interface RoleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}

export function RoleFormSheet({ open, onOpenChange, role }: RoleFormSheetProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => roleService.getPermissions(),
    enabled: open,
  });

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", permissions: [] },
  });

  useEffect(() => {
    if (open) {
      if (role) {
        // Inicializar permisos priorizando el array de objetos, luego el array de IDs en permissions_pluck
        const perms = role.permissions?.map((p) => p.id) || 
                      role.permissions_pluck?.map(p => Number(p)) || [];
        
        reset({
          name: role.name,
          permissions: perms,
        });
      } else {
        reset({ name: "", permissions: [] });
      }
      setSearchTerm("");
    }
  }, [open, role, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      role
        ? roleService.updateRole(role.id, values.name, values.permissions)
        : roleService.createRole(values.name, values.permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onOpenChange(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    saveMutation.mutate(data);
  };

  const selectedPermissions = watch("permissions");

  const togglePermission = (id: number) => {
    const current = selectedPermissions || [];
    if (current.includes(id)) {
      setValue("permissions", current.filter((p) => p !== id), { shouldDirty: true });
    } else {
      setValue("permissions", [...current, id], { shouldDirty: true });
    }
  };

  const handleToggleAllInModule = (module: string, ids: number[]) => {
    const current = selectedPermissions || [];
    // Determinar si todos los IDs del módulo están seleccionados
    const allSelected = ids.every((id) => current.includes(id));
    let newPermissions: number[];
    if (allSelected) {
      // Deseleccionar todos los del módulo
      newPermissions = current.filter((id) => !ids.includes(id));
    } else {
      // Seleccionar todos los del módulo (sin duplicados)
      const toAdd = ids.filter((id) => !current.includes(id));
      newPermissions = [...current, ...toAdd];
    }
    setValue("permissions", newPermissions, { shouldDirty: true });
  };

  const filteredGroupedPermissions = useMemo(() => {
    if (!permissions) return {};
    const filtered = searchTerm
      ? permissions.filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.module?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : permissions;
    return filtered.reduce<Record<string, Permission[]>>((acc, perm) => {
      const mod = perm.module || "General";
      if (!acc[mod]) acc[mod] = [];
      acc[mod].push(perm);
      return acc;
    }, {});
  }, [permissions, searchTerm]);

  const selectedCount = selectedPermissions?.length || 0;
  const totalCount = permissions?.length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 gap-0 w-full sm:max-w-[520px] h-full max-h-screen">
        {/* Cabecera fija */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-2 shrink-0">
              <Shield size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-lg font-semibold leading-snug">
                {role ? "Editar Rol" : "Crear Nuevo Rol"}
              </SheetTitle>
              <SheetDescription className="text-sm mt-0.5 leading-relaxed">
                {role
                  ? "Configura los permisos estipulados para este rol."
                  : "Añade un nuevo rol y asígnale su nivel de acceso."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto">
          <form id="role-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-6">
              {/* Nombre del rol */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">
                  Nombre del Rol
                </label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ej: Administrador, Vendedor..."
                      className={`h-10 ${
                        errors.name
                          ? "border-destructive focus-visible:ring-destructive/30"
                          : ""
                      }`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Sección de permisos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground">
                    Permisos de Acceso
                  </label>
                  {selectedCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {selectedCount} de {totalCount} seleccionados
                    </span>
                  )}
                </div>

                {/* Buscador */}
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <Input
                    placeholder="Buscar permisos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-8 text-sm bg-muted/40 border-border/60 focus:bg-background"
                  />
                </div>

                {/* Lista de grupos de permisos */}
                <div className="space-y-2.5">
                  {Object.keys(filteredGroupedPermissions).length === 0 ? (
                    <div className="text-sm text-muted-foreground py-8 text-center border border-dashed rounded-xl">
                      {searchTerm
                        ? "Sin resultados para tu búsqueda."
                        : "Cargando catálogo de permisos..."}
                    </div>
                  ) : (
                    Object.entries(filteredGroupedPermissions).map(
                      ([module, perms]) => (
                        <PermissionGroup
                          key={module}
                          module={module}
                          permissions={perms}
                          selectedIds={selectedPermissions || []}
                          onToggle={togglePermission}
                          onToggleAll={handleToggleAllInModule}
                        />
                      )
                    )
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer fijo */}
        <SheetFooter className="shrink-0 px-6 py-4 border-t border-border/60 bg-muted/20 flex flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="role-form"
            disabled={saveMutation.isPending}
            className="flex-1 sm:flex-none shadow-sm"
          >
            {saveMutation.isPending ? "Guardando..." : "Guardar Rol"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}