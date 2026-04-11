"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { brandService } from "@/services/brand"
import { BrandsTable } from "@/feature/brands/components/BrandsTable"
import { BrandForm } from "./components/BrandForm"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Brand } from "@/types/brand"

export default function BrandsFeature() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get("page")) || 1
  const search = searchParams.get("search") || ""

  // Estado para controlar el Sheet
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [selectedBrand, setSelectedBrand] = React.useState<Brand | undefined>(undefined)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["brands", page, search],
    queryFn: () => brandService.getBrands(page, search),
  })

  const handlePagination = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/catalog/brands?${params.toString()}`)
  }

  const handleCreate = () => {
    setSelectedBrand(undefined)
    setSheetOpen(true)
  }

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand)
    setSheetOpen(true)
  }

  const handleSuccess = () => {
    refetch()
  }

  return (
    <>
      <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Marcas
            </h1>
          </div>
          <Button onClick={handleCreate} className="shadow-sm w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nueva Marca
          </Button>
        </div>

        <BrandsTable
          data={data?.brands || []}
          isLoading={isLoading}
          pageCount={data?.total ? Math.ceil(data.total / (data.paginate || 25)) : 1}
          pageIndex={page}
          onPaginationChange={handlePagination}
          onEdit={handleEdit}
        />
      </div>

      <BrandForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        brand={selectedBrand}
        onSuccess={handleSuccess}
      />
    </>
  )
}