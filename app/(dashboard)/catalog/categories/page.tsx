"use client"

import { Suspense } from "react"
import CategoriesFeature from "@/feature/categories"

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <CategoriesFeature />
    </Suspense>
  )
}
