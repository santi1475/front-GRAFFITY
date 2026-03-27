"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Home, ArrowLeft } from "lucide-react"

export default function Error404() {
  const router = useRouter()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-12">
      <div className="relative mb-8">
        <h1 className="text-[10rem] font-black leading-none tracking-tighter text-primary/10 select-none md:text-[14rem]">
          404
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <p className="text-lg font-semibold text-foreground">Página no encontrada</p>
        </div>
      </div>

      <p className="max-w-md text-center text-muted-foreground mb-8">
        Lo sentimos, la página que buscas no existe o fue movida a otra ubicación.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button onClick={() => router.push("/")}>
          <Home className="mr-2 h-4 w-4" />
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}
