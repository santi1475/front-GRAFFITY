"use client"

import * as React from "react"
import { Category } from "@/types/category"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit2, Trash2, Tag, MoreHorizontal } from "lucide-react"
import { getIconByName } from "@/components/ui/icon-picker"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { categoryService } from "@/services/category"
import { toast } from "sonner"

interface CategoriesTableProps {
  data: Category[]
  isLoading: boolean
  pageCount: number
  pageIndex: number
  onPaginationChange: (page: number) => void
  onEdit: (category: Category) => void  // 👈 Agregar esta prop
}

export function CategoriesTable({
  data,
  isLoading,
  pageCount,
  pageIndex,
  onPaginationChange,
  onEdit,
}: CategoriesTableProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [categoryToDelete, setCategoryToDelete] = React.useState<Category | null>(null)

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      return categoryService.patchCategory(id, { is_active: is_active ? "True" : "False" })
    },
    onMutate: async ({ id, is_active }) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] })
      const previousCategories = queryClient.getQueryData(["categories"])
      queryClient.setQueriesData({ queryKey: ["categories"] }, (old: any) => {
        if (!old) return old
        return {
          ...old,
          categories: old.categories.map((c: Category) =>
            c.id === id ? { ...c, is_active } : c
          ),
        }
      })
      toast.loading("Actualizando estado...", { id: "toggle-status" })
      return { previousCategories }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueriesData({ queryKey: ["categories"] }, context?.previousCategories)
      toast.error("Error al actualizar el estado", { id: "toggle-status" })
    },
    onSuccess: () => {
      toast.success("Estado actualizado", { id: "toggle-status" })
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Categoría eliminada correctamente")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setCategoryToDelete(null)
    },
    onError: () => {
      toast.error("Error al eliminar la categoría")
    },
  })

  const getDynamicIcon = (iconName: string | null) => {
    const Icon = getIconByName(iconName) || Tag
    return <Icon className="size-4 text-muted-foreground" />
  }

  // handleEditClick is removed since we use onEdit passed from props.

  const confirmDelete = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete.id)
    }
  }

  return (
    <>
      <Card className="shadow-sm border-border overflow-hidden">
        <CardContent className="p-0">

          {/* Vista desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Imagen</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Nombre</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Icono</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground">Estado</th>
                  <th className="px-6 py-4 text-right font-semibold text-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-10 rounded-md" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : data.length ? (
                  data.map((category) => (
                    <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <Avatar className="h-10 w-10 rounded-md border">
                          <AvatarImage
                            src={category.image ? `${process.env.NEXT_PUBLIC_API_URL}${category.image}` : undefined}
                            className="object-contain p-1"
                          />
                          <AvatarFallback className="rounded-md bg-muted text-xs">IMG</AvatarFallback>
                        </Avatar>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">{category.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50">
                            {getDynamicIcon(category.icon_name)}
                          </span>
                          <span className="text-sm text-muted-foreground truncate">
                            {category.icon_name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={category.is_active}
                            onCheckedChange={(checked) =>
                              toggleStatusMutation.mutate({ id: category.id, is_active: checked })
                            }
                          />
                          <Badge variant={category.is_active ? "default" : "secondary"}>
                            {category.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => onEdit(category)} className="h-8 px-2">
                            <Edit2 className="h-4 w-4 mr-1" />
                            <span className="hidden lg:inline">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCategoryToDelete(category)}
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
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No hay categorías registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Vista móvil */}
          <div className="md:hidden divide-y">
            {isLoading ? (
              <div className="p-4"><Skeleton className="h-20 w-full" /></div>
            ) : data.map((category) => (
              <div key={category.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-md border">
                    <AvatarImage
                      src={category.image ? `${process.env.NEXT_PUBLIC_API_URL}${category.image}` : undefined}
                      className="object-contain p-1"
                    />
                    <AvatarFallback className="rounded-md bg-muted text-xs">IMG</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{category.title}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${category.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {category.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(category)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setCategoryToDelete(category)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {pageCount > 1 && (
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex <= 1}
                onClick={() => onPaginationChange(pageIndex - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {pageIndex} de {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex >= pageCount}
                onClick={() => onPaginationChange(pageIndex + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar categoría</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría "{categoryToDelete?.title}"?
              Esta acción no puede deshacerse de forma manual desde el portal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setCategoryToDelete(null)}>
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
    </>
  )
}
