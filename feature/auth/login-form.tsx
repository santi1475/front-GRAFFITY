"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authService } from "@/services/auth"
import { useAuthStore } from "@/store/auth"
import { Loader2 } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const saveSession = useAuthStore((s) => s.saveSession)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await authService.login(email, password)
      saveSession(data)
      const redirect = searchParams.get("redirect") || "/"
      router.push(redirect)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                    <span className="text-lg font-bold text-primary-foreground">G</span>
                  </div>
                  <span className="text-xl font-bold tracking-tight">Graffity POS</span>
                </div>
                <h1 className="text-2xl font-bold">Bienvenido</h1>
                <p className="text-balance text-muted-foreground">
                  Inicia sesión en tu cuenta
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/90 shadow-2xl mb-6">
                <span className="text-3xl font-black text-primary-foreground">G</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground/80 mb-2">Graffity POS</h2>
              <p className="text-center text-sm text-muted-foreground max-w-[240px]">
                Sistema de punto de venta moderno y eficiente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        Graffity POS &copy; {new Date().getFullYear()}. Todos los derechos reservados.
      </FieldDescription>
    </div>
  )
}
