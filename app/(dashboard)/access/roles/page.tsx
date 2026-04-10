"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { RoleFormSheet } from "@/feature/roles/RoleGroup";
import { Role } from "@/types/roles";

export default function RolesPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const queryClient = useQueryClient();

  const { data: rolesResponse, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => roleService.getRoles(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setRoleToDelete(null);
    },
  });

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
  };

  const confirmDelete = () => {
    if (roleToDelete) {
      deleteMutation.mutate(roleToDelete.id);
    }
  };

  // Función para obtener una vista previa de permisos
  const getPermissionPreview = (role: Role) => {
    const perms = role.permissions || [];
    if (perms.length === 0) return "Sin permisos";
    const names = perms.slice(0, 2).map(p => p.name).join(", ");
    return perms.length > 2 ? `${names} +${perms.length - 2}` : names;
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Roles y Permisos
          </h1>
        </div>
        <Button onClick={handleCreate} className="shadow-sm w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Crear Rol
        </Button>
      </div>

      {/* Contenido principal */}
      <Card className="shadow-sm border-border overflow-hidden">
        <CardContent className="p-0">
          {/* Vista de escritorio: Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Nombre del Rol
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Permisos
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Creado
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : rolesResponse?.roles?.length ? (
                  rolesResponse.roles.map((role) => (
                    <tr key={role.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{role.name}</td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {getPermissionPreview(role)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-sm">
                        {role.created_at
                          ? new Date(role.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(role)}
                            className="h-8 px-2"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            <span className="hidden lg:inline">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(role)}
                            className="h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="hidden lg:inline">Eliminar</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                      No hay roles registrados. Crea uno nuevo para comenzar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Vista móvil: Tarjetas */}
          <div className="md:hidden divide-y">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
            ) : rolesResponse?.roles?.length ? (
              rolesResponse.roles.map((role) => (
                <div key={role.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-semibold text-foreground">{role.name}</h3>
                      <p className="text-sm text-muted-foreground break-words">
                        {getPermissionPreview(role)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Creado:{" "}
                        {role.created_at
                          ? new Date(role.created_at).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(role)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(role)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No hay roles registrados.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sheet para crear/editar */}
      <RoleFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        role={selectedRole}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar rol</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar el rol "{roleToDelete?.name}"?
              Esta acción no se puede deshacer y los usuarios con este rol podrían
              perder acceso.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoleToDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}