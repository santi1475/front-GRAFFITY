"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { categoryService } from "@/services/category"
import { CategoriesTable } from "./components/CategoriesTable"
import { CategoryForm } from "./components/CategoryForm"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Category } from "@/types/category"

export default function CategoriesFeature() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get("page")) || 1
  const search = searchParams.get("search") || ""

  // Estado para controlar el Sheet
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<Category | undefined>(undefined)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["categories", page, search],
    queryFn: () => categoryService.getCategories(page, search),
  })

  const handlePagination = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/catalog/categories?${params.toString()}`)
  }

  const handleCreate = () => {
    setSelectedCategory(undefined)
    setSheetOpen(true)
  }

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setSheetOpen(true)
  }

  const handleSuccess = () => {
    refetch() // Recargar la lista después de crear/editar
  }

  return (
    <>
      <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Categorías
            </h1>
          </div>
          <Button onClick={handleCreate} className="shadow-sm w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
          </Button>
        </div>

        <CategoriesTable
          data={data?.categories || []}
          isLoading={isLoading}
          pageCount={data?.total ? Math.ceil(data.total / (data.paginate || 25)) : 1}
          pageIndex={page}
          onPaginationChange={handlePagination}
          onEdit={handleEdit} // 👈 Pasamos la función de edición a la tabla
        />
      </div>

      {/* Sheet lateral para crear/editar */}
      <CategoryForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />
    </>
  )
}