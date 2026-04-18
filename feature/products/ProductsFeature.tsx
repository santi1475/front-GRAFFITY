"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { productService } from "@/services/product"
import { ProductsTable } from "./components/ProductsTable"
import { ProductForm } from "./components/ProductForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter } from "lucide-react"
import { Product } from "@/types/product"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ProductsFeature({ initialOpen = false }: { initialOpen?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get("page")) || 1
  const search = searchParams.get("search") || ""
  const categoryId = searchParams.get("category_id") || ""
  const brandId = searchParams.get("brand_id") || ""

  const [sheetOpen, setSheetOpen] = React.useState(initialOpen)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>(undefined)

  React.useEffect(() => {
    if (initialOpen) {
        setSheetOpen(true)
    }
  }, [initialOpen])
  const [searchInput, setSearchInput] = React.useState(search)

  // Query de productos
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", page, search, categoryId, brandId],
    queryFn: () => productService.getProducts({ 
        page, 
        search, 
        categorie_id: categoryId, 
        brand_id: brandId 
    }),
  })

  // Query de configuraciones (categorías, marcas)
  const { data: configData } = useQuery({
    queryKey: ["products_config"],
    queryFn: () => productService.getProductConfig(),
  })

  const handlePagination = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/products/list?${params.toString()}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchInput) params.set("search", searchInput)
    else params.delete("search")
    params.set("page", "1")
    router.push(`/products/list?${params.toString()}`)
  }

  const handleCreate = () => {
    setSelectedProduct(undefined)
    setSheetOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
            Gestión de Productos
          </h1>
          <p className="text-muted-foreground text-sm">
            Administre su catálogo de productos y escanee códigos de barras.
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o SKU..."
            className="pl-10 bg-white/5 border-white/10 focus:ring-primary/50"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        
        <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/10">
                  <Filter className="mr-2 h-4 w-4" /> Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/95 backdrop-blur-md border-white/10 w-48">
                <DropdownMenuItem onClick={() => {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("category_id")
                    params.delete("brand_id")
                    router.push(`/products/list?${params.toString()}`)
                }}>
                    Limpiar filtros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

      <ProductsTable
        data={data?.products || []}
        isLoading={isLoading}
        pageCount={data?.total ? Math.ceil(data.total / (data.page_size || 25)) : 1}
        pageIndex={page}
        onPaginationChange={handlePagination}
        onEdit={handleEdit}
      />

      <ProductForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        product={selectedProduct}
        onSuccess={refetch}
        config={configData}
      />
    </div>
  )
}
