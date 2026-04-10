"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SprayCan, Search, X, ChevronRight } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { menu_item } from "@/assets/data/menu-items"
import type { MenuItemType } from "@/types/menu"

// ─── helpers ─────────────────────────────────────────────────────────────────

const navItems = menu_item.filter((item) => !item.isTitle)

// ─── Detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  activeItem: MenuItemType
  searchQuery: string
  onSearchChange: (val: string) => void
  onNavigate: (route: MenuItemType["route"]) => void
  onClose: () => void
  panelRef: React.RefObject<HTMLDivElement | null>  // ← fix TS error
}

function DetailPanel({ activeItem, searchQuery, onSearchChange, onNavigate, onClose, panelRef }: DetailPanelProps) {
  const allChildren = activeItem.children ?? []

  const filtered = searchQuery.trim()
    ? allChildren.filter((c) => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allChildren

  return (
    <div
      ref={panelRef}
      className="hidden md:flex flex-col w-56 shrink-0 border-l bg-sidebar overflow-hidden"
    >
      <div className="border-b px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeItem.icon && typeof activeItem.icon !== "string" && (
              <activeItem.icon className="size-4 text-muted-foreground" />
            )}
            <span className="text-sm font-semibold text-foreground">{activeItem.label}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {allChildren.length > 0 && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-md border bg-transparent pl-8 pr-8 h-8 text-xs outline-none focus:ring-1 focus:ring-ring"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground">
            Sin resultados para &ldquo;{searchQuery}&rdquo;
          </p>
        ) : (
          filtered.map((child) => (
            <button
              key={child.key}
              onClick={() => child.route && onNavigate(child.route)}
              className="group flex w-full items-center gap-3 border-b px-4 py-3 text-left text-sm last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              {child.icon && typeof child.icon !== "string" && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground group-hover:border-sidebar-accent-foreground/20 transition-colors">
                  <child.icon className="size-3.5" />
                </span>
              )}
              <span className="flex-1 font-medium">{child.label}</span>
              <ChevronRight className="size-3.5 opacity-0 transition-all group-hover:opacity-50 group-hover:translate-x-0.5" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  activeItem: MenuItemType | null
  onNavigate: (route: MenuItemType["route"]) => void
}

function MobileMenu({ open, onClose, activeItem, onNavigate }: MobileMenuProps) {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  if (!open || !activeItem) return null
  const children = activeItem.children ?? []

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t bg-background shadow-xl md:hidden animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-muted" />
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {activeItem.icon && typeof activeItem.icon !== "string" && (
              <activeItem.icon className="size-4 text-muted-foreground" />
            )}
            <span className="font-semibold text-sm">{activeItem.label}</span>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-[60dvh] overflow-y-auto">
          {children.length === 0 ? (
            <button
              onClick={() => { activeItem.route && onNavigate(activeItem.route); onClose() }}
              className="flex w-full items-center justify-between px-4 py-4 text-sm font-medium hover:bg-muted transition-colors"
            >
              <span>Ir a {activeItem.label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          ) : (
            children.map((child) => (
              <button
                key={child.key}
                onClick={() => { child.route && onNavigate(child.route); onClose() }}
                className="flex w-full items-center gap-3 border-t px-4 py-3.5 text-left text-sm hover:bg-muted transition-colors"
              >
                {child.icon && typeof child.icon !== "string" && (
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <child.icon className="size-4 text-muted-foreground" />
                  </span>
                )}
                <span className="font-medium">{child.label}</span>
                <ChevronRight className="ml-auto size-4 text-muted-foreground" />
              </button>
            ))
          )}
          <div className="h-4" />
        </div>
      </div>
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()

  const [activeItem, setActiveItem] = React.useState<MenuItemType | null>(null)
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const showDetailPanel = panelOpen && Boolean(activeItem?.children?.length)

  const railRef = React.useRef<HTMLDivElement | null>(null)
  const panelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      const insideRail = railRef.current?.contains(target)
      const insidePanel = panelRef.current?.contains(target)
      if (!insideRail && !insidePanel) setPanelOpen(false)
    }
    if (panelOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [panelOpen])

  function closePanel() {
    setPanelOpen(false)
    setSearchQuery("")
  }

  function handleItemClick(item: MenuItemType) {
    if (item.children?.length) {
      if (activeItem?.key === item.key && panelOpen) {
        closePanel()
      } else {
        setActiveItem(item)
        setPanelOpen(true)
        setSearchQuery("")
        setMobileOpen(true)
      }
    } else {
      closePanel()
      setActiveItem(item)
      if (item.route) router.push(`/${item.route.name.replace(/\./g, "/")}`)
    }
  }

  function handleNavigate(route: MenuItemType["route"]) {
    if (!route) return
    router.push(`/${route.name.replace(/\./g, "/")}`)
  }

  return (
    <>
      <div ref={railRef} className="flex h-full">
        <Sidebar collapsible="none" className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r" {...props}>
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                  <a href="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground dark:bg-white">
                      <SprayCan className="size-4 dark:text-sidebar-primary" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">Acme Inc</span>
                      <span className="truncate text-xs">Enterprise</span>
                    </div>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="px-1.5 md:px-0">
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        tooltip={{ children: item.label, hidden: false }}
                        onClick={() => handleItemClick(item)}
                        isActive={activeItem?.key === item.key && panelOpen}
                        className="px-2.5 md:px-2"
                      >
                        {item.icon && typeof item.icon !== "string" ? <item.icon /> : null}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {showDetailPanel && activeItem && (
          <DetailPanel
            activeItem={activeItem}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNavigate={handleNavigate}
            onClose={closePanel}
            panelRef={panelRef}
          />
        )}
      </div>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeItem={activeItem}
        onNavigate={handleNavigate}
      />
    </>
  )
}