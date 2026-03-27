"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/store/auth"
import { Lock, LogOut, Loader2 } from "lucide-react"
import { authService } from "@/services/auth"

export default function LockScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const saveSession = useAuthStore((s) => s.saveSession)
  const removeSession = useAuthStore((s) => s.removeSession)

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return

    setError(null)
    setLoading(true)

    try {
      const data = await authService.login(user.email, password)
      saveSession(data)
      router.push("/")
    } catch {
      setError("Contraseña incorrecta")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    removeSession()
    router.push("/login")
  }

  const initials = user
    ? `${(user.name?.[0] || "").toUpperCase()}${(user.surname?.[0] || "").toUpperCase()}`
    : "?"

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">{initials}</span>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {user?.name} {user?.surname || ""}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Sesión bloqueada
          </div>

          {error && (
            <div className="w-full rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <Input
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              autoFocus
              autoComplete="current-password"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desbloqueando...
                </>
              ) : (
                "Desbloquear"
              )}
            </Button>
          </form>

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
