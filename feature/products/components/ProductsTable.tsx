"use client"

import * as React from "react"
import { Product } from "@/types/product"
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
import { Edit2, Trash2, Package, MoreHorizontal, Eye } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { productService } from "@/services/product"
import { toast } from "sonner"

interface ProductsTableProps {
  data: Product[]
  isLoading: boolean
  pageCount: number
  pageIndex: number
  onPaginationChange: (page: number) => void
  onEdit: (product: Product) => void
}

export function ProductsTable({
  data,
  isLoading,
  pageCount,
  pageIndex,
  onPaginationChange,
  onEdit,
}: ProductsTableProps) {
  const queryClient = useQueryClient()
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => {
      toast.success("Producto eliminado correctamente")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setProductToDelete(null)
    },
    onError: () => {
      toast.error("Error al eliminar el producto")
    },
  })

  // Update product state via toggle
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, state }: { id: number; state: boolean }) => {
        const formData = new FormData()
        formData.append("id", String(id))
        formData.append("state", state ? "1" : "0")
        return productService.updateProduct(id, formData)
    },
    onSuccess: () => {
        toast.success("Estado actualizado")
        queryClient.invalidateQueries({ queryKey: ["products"] })
    }
  })

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id)
    }
  }

  return (
    <>
      <Card className="glass-morphism overflow-hidden border-white/10 bg-white/5 backdrop-blur-md">
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-foreground/80 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground/80 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground/80 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-4 text-left font-semibold text-foreground/80 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right font-semibold text-foreground/80 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-md" /><Skeleton className="h-4 w-24" /></div></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-5 w-16" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : data.length ? (
                  data.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 rounded-lg border border-white/10">
                            <AvatarImage
                              src={product.image ? `${process.env.NEXT_PUBLIC_API_URL}${product.image}` : undefined}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-white/5"><Package className="h-4 w-4" /></AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{product.title}</span>
                            <span className="text-xs text-muted-foreground">Cat ID: {product.category_id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{product.sku}</td>
                      <td className="px-6 py-4 font-semibold">S/ {product.price_general}</td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                           <Switch
                             checked={product.state}
                             onCheckedChange={(checked) =>
                               toggleStatusMutation.mutate({ id: product.id, state: checked })
                             }
                           />
                           <Badge variant={product.state ? "default" : "secondary"} className={product.state ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}>
                             {product.state ? "Activo" : "Inactivo"}
                           </Badge>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-8 w-8 hover:bg-white/10">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductToDelete(product)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No se encontraron productos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden divide-y divide-white/5">
            {data.map((product) => (
              <div key={product.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-lg border border-white/10">
                    <AvatarImage src={product.image || undefined} />
                    <AvatarFallback><Package className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{product.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-sm border-white/10">
                    <DropdownMenuItem onClick={() => onEdit(product)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setProductToDelete(product)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-white/10"
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
                className="bg-white/5 border-white/10"
                disabled={pageIndex >= pageCount}
                onClick={() => onPaginationChange(pageIndex + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <DialogContent className="glass-morphism border-white/10">
          <DialogHeader>
            <DialogTitle>Eliminar producto</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              ¿Estás seguro de que deseas eliminar "{productToDelete?.title}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setProductToDelete(null)} className="bg-white/5 border-white/10">
              Cancelar
            </Button>
            <Button
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
