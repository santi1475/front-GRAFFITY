"use client"

import { Suspense } from "react"
import BrandsFeature from "@/feature/brands"

export default function BrandsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
      <BrandsFeature />
    </Suspense>
  )
}
