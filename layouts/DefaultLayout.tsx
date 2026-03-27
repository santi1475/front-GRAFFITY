"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import TopBar from "./components/TopBar"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { useTheme } from "next-themes"

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, removeSession } = useAuthStore()
    const { theme, setTheme, resolvedTheme } = useTheme()

    // SESSION GUARD: Verificación periódica del token (DevTools check)
    React.useEffect(() => {
        const checkAuth = () => {
            const hasCookie = document.cookie.includes('token=')
            const hasLocal = localStorage.getItem('token')
            
            // Si falta cualquiera de los dos (cookie o local), cerramos sesión por seguridad
            if ((!hasCookie || !hasLocal) && user) {
                removeSession()
                router.push('/login')
            }
        }

        // Ejecutar inmediatamente al montar
        checkAuth()

        const interval = setInterval(checkAuth, 2000)
        window.addEventListener('storage', checkAuth)

        return () => {
            clearInterval(interval)
            window.removeEventListener('storage', checkAuth)
        }
    }, [user, removeSession, router])

    const handleLogout = () => {
        removeSession()
        router.push('/login')
    }

    // Generar breadcrumbs dinámicos basados en la ruta actual
    const generateBreadcrumbs = () => {
        const paths = pathname.split('/').filter(Boolean)
        return paths.map((path, index) => {
            const href = '/' + paths.slice(0, index + 1).join('/')
            const isLast = index === paths.length - 1
            const label = path.charAt(0).toUpperCase() + path.slice(1)

            return {
                href,
                label,
                isLast
            }
        })
    }

    const breadcrumbs = generateBreadcrumbs()

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "350px",
                } as React.CSSProperties
            }
        >
            <AppSidebar />
            <SidebarInset>
                {/* Header simplificado y bien estructurado */}
                <div className="sticky top-0 z-10 w-full border-b bg-background">
                    <div className="flex h-16 items-center justify-between px-4">
                        {/* Sección izquierda: SidebarTrigger y Breadcrumb */}
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="h-4" />
                            <div className="mr-20 pl-4 w-48">
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                                        </BreadcrumbItem>
                                        {breadcrumbs.length > 0 && breadcrumbs[0].href !== '/' && (
                                            <BreadcrumbSeparator />
                                        )}
                                        {breadcrumbs.map((crumb, index) => {
                                            if (crumb.href === '/') return null;
                                            return (
                                                <React.Fragment key={crumb.href}>
                                                    <BreadcrumbItem>
                                                        {crumb.isLast ? (
                                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                                        ) : (
                                                            <BreadcrumbLink href={crumb.href}>
                                                                {crumb.label}
                                                            </BreadcrumbLink>
                                                        )}
                                                    </BreadcrumbItem>
                                                    {!crumb.isLast && index < breadcrumbs.length - 1 && (
                                                        <BreadcrumbSeparator />
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                        </div>

                        {/* Sección derecha: TopBar */}
                        <TopBar 
                            user={user} 
                            theme={theme} 
                            onToggleTheme={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                            onLogout={handleLogout}
                        />
                    </div>
                </div>

                {/* Contenido principal */}
                <div className="flex-1 overflow-auto">
                    <div className="p-4">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}