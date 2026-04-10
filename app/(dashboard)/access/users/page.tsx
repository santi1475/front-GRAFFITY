"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user";
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
import { UserFormSheet } from "@/feature/users/UserGroup";
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UsersPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ["users", page, search],
    queryFn: () => userService.getUsers(page, search),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setUserToDelete(null);
    },
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsSheetOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.id);
    }
  };

  const parseAvatar = (url: string | null) => {
      if (!url) return null;
      return url.includes('http') ? url : `http://localhost:8000${url}`;
  };

  const getGenderText = (gender: number | null) => {
      if (gender === 1) return "Masculino";
      if (gender === 2) return "Femenino";
      return "No especificado";
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Usuarios del Sistema
          </h1>
        </div>
        <Button onClick={handleCreate} className="shadow-sm w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Crear Usuario
        </Button>
      </div>

      {/* Buscar
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input type="text" placeholder="Buscar usuarios..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>  */}

      <Card className="shadow-sm border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Usuario</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Contacto</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Rol / Género</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Estado</th>
                  <th className="px-6 py-4 text-right font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : response?.users?.length ? (
                  response.users.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                  <AvatarImage src={parseAvatar(user.avatar) || ''} />
                                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                  <p className="font-semibold text-foreground">{user.name} {user.surname}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                          </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {user.phone || 'Sin teléfono'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="font-medium">{user.role?.name || "Sin Rol"}</span>
                        <div className="text-xs mt-0.5">{getGenderText(user.gender)}</div>
                      </td>
                      <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                              {user.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} className="h-8 px-2">
                            <Pencil className="h-4 w-4 mr-1" />
                            <span className="hidden lg:inline">Editar</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(user)} className="h-8 px-2 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-1" />
                            <span className="hidden lg:inline">Eliminar</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y">
             {/* VISTA MÓVIL SIMPLIFICADA AQUÍ */}
             {isLoading ? (
                  <div className="p-4"><Skeleton className="h-20 w-full" /></div>
             ) : response?.users?.map(user => (
                 <div key={user.id} className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={parseAvatar(user.avatar) || ''} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                         </Avatar>
                         <div>
                             <p className="font-semibold text-sm">{user.name}</p>
                             <p className="text-xs text-muted-foreground">{user.role?.name || "Sin Rol"}</p>
                         </div>
                     </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(user)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteClick(user)}><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
             ))}
          </div>
        </CardContent>
      </Card>

      <UserFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        user={selectedUser}
        roles={response?.roles || []}
      />

      <Dialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario "{userToDelete?.name}"?
              Esta acción no puede deshacerse de forma manual desde el portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setUserToDelete(null)}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
