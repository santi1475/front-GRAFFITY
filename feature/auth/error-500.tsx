"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Home, RefreshCw } from "lucide-react"

export default function Error500() {
  const router = useRouter()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-12">
      <div className="relative mb-8">
        <h1 className="text-[10rem] font-black leading-none tracking-tighter text-destructive/10 select-none md:text-[14rem]">
          500
        </h1>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-lg font-semibold text-foreground">Error del servidor</p>
        </div>
      </div>

      <p className="max-w-md text-center text-muted-foreground mb-8">
        Algo salió mal en nuestro servidor. Por favor intenta de nuevo en unos momentos.
      </p>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.refresh()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
        <Button onClick={() => router.push("/")}>
          <Home className="mr-2 h-4 w-4" />
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}
