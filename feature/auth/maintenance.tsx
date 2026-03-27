"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Home, Settings } from "lucide-react"

export default function Maintenance() {
  const router = useRouter()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-12">
      <div className="mb-8 flex items-center justify-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <Settings className="h-12 w-12 text-primary animate-[spin_4s_linear_infinite]" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Settings className="h-4 w-4 text-primary animate-[spin_3s_linear_infinite_reverse]" />
          </div>
        </div>
      </div>

      <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground">
        En mantenimiento
      </h1>

      <p className="max-w-md text-center text-muted-foreground mb-2">
        Estamos realizando mejoras en el sistema. Volveremos pronto con una mejor experiencia.
      </p>

      <p className="text-sm text-muted-foreground/60 mb-8">
        Tiempo estimado: 30 minutos
      </p>

      <Button variant="outline" onClick={() => router.push("/")}>
        <Home className="mr-2 h-4 w-4" />
        Intentar nuevamente
      </Button>
    </div>
  )
}
