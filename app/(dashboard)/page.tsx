"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth"
import { LayoutDashboard, Package, Users, TrendingUp } from "lucide-react"

const stats = [
  { label: "Ventas hoy", value: "—", icon: TrendingUp, color: "text-emerald-500" },
  { label: "Productos", value: "—", icon: Package, color: "text-blue-500" },
  { label: "Usuarios", value: "—", icon: Users, color: "text-violet-500" },
  { label: "Categorías", value: "—", icon: LayoutDashboard, color: "text-amber-500" },
]

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido{user?.name ? `, ${user.name}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Resumen general de tu punto de venta
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <stat.icon className={`size-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <TrendingUp className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Ventas recientes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Las estadísticas se mostrarán aquí
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <Package className="size-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Inventario</h3>
            <p className="text-sm text-muted-foreground mt-1">
              El estado del inventario se mostrará aquí
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
