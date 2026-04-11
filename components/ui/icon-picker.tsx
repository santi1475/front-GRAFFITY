"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Search, X } from "lucide-react"

// ─── Catálogo curado de iconos Lucide para contexto POS/Comercial ────────────
// Importamos solo los que necesitamos para evitar bundle bloat.
import {
  Tag, Award, Shield, Star, Heart, Zap, Crown, Diamond, Gem,
  Flame, Sparkles, Sun, Moon, Leaf, Droplets, Mountain, TreePine,
  ShoppingCart, ShoppingBag, Store, Package, Gift, Truck, Warehouse,
  Barcode, QrCode, CreditCard, Wallet, Banknote, Receipt, BadgePercent,
  Shirt, Watch, Glasses, Footprints, Brush, Palette, Scissors, Wrench,
  Hammer, Plug, Lightbulb, Smartphone, Monitor, Headphones, Camera,
  Printer, Wifi, Globe, Building2, Home, MapPin, Phone, Mail,
  Clock, Calendar, BookOpen, FileText, Clipboard, PenTool,
  Coffee, UtensilsCrossed, Wine, Cherry, Apple, Beef, Fish, Cake,
  Baby, Cat, Dog, Bird, Bug, Flower2,
  CircleDot, Hexagon, Pentagon, Triangle, Square, Circle,
  type LucideIcon,
} from "lucide-react"

// ─── Registro de iconos con nombre legible y categoría ───────────────────────

interface IconEntry {
  name: string
  label: string
  icon: LucideIcon
  category: string
}

const ICON_CATALOG: IconEntry[] = [
  // Marcas / Identidad
  { name: "Tag", label: "Etiqueta", icon: Tag, category: "Marcas" },
  { name: "Award", label: "Premio", icon: Award, category: "Marcas" },
  { name: "Shield", label: "Escudo", icon: Shield, category: "Marcas" },
  { name: "Star", label: "Estrella", icon: Star, category: "Marcas" },
  { name: "Heart", label: "Corazón", icon: Heart, category: "Marcas" },
  { name: "Zap", label: "Rayo", icon: Zap, category: "Marcas" },
  { name: "Crown", label: "Corona", icon: Crown, category: "Marcas" },
  { name: "Diamond", label: "Diamante", icon: Diamond, category: "Marcas" },
  { name: "Gem", label: "Gema", icon: Gem, category: "Marcas" },
  { name: "Flame", label: "Llama", icon: Flame, category: "Marcas" },
  { name: "Sparkles", label: "Destellos", icon: Sparkles, category: "Marcas" },

  // Naturaleza
  { name: "Sun", label: "Sol", icon: Sun, category: "Naturaleza" },
  { name: "Moon", label: "Luna", icon: Moon, category: "Naturaleza" },
  { name: "Leaf", label: "Hoja", icon: Leaf, category: "Naturaleza" },
  { name: "Droplets", label: "Gotas", icon: Droplets, category: "Naturaleza" },
  { name: "Mountain", label: "Montaña", icon: Mountain, category: "Naturaleza" },
  { name: "TreePine", label: "Pino", icon: TreePine, category: "Naturaleza" },
  { name: "Flower2", label: "Flor", icon: Flower2, category: "Naturaleza" },

  // Comercio
  { name: "ShoppingCart", label: "Carrito", icon: ShoppingCart, category: "Comercio" },
  { name: "ShoppingBag", label: "Bolsa", icon: ShoppingBag, category: "Comercio" },
  { name: "Store", label: "Tienda", icon: Store, category: "Comercio" },
  { name: "Package", label: "Paquete", icon: Package, category: "Comercio" },
  { name: "Gift", label: "Regalo", icon: Gift, category: "Comercio" },
  { name: "Truck", label: "Camión", icon: Truck, category: "Comercio" },
  { name: "Warehouse", label: "Almacén", icon: Warehouse, category: "Comercio" },
  { name: "Barcode", label: "Código barras", icon: Barcode, category: "Comercio" },
  { name: "QrCode", label: "Código QR", icon: QrCode, category: "Comercio" },

  // Finanzas
  { name: "CreditCard", label: "Tarjeta", icon: CreditCard, category: "Finanzas" },
  { name: "Wallet", label: "Billetera", icon: Wallet, category: "Finanzas" },
  { name: "Banknote", label: "Billete", icon: Banknote, category: "Finanzas" },
  { name: "Receipt", label: "Recibo", icon: Receipt, category: "Finanzas" },
  { name: "BadgePercent", label: "Descuento", icon: BadgePercent, category: "Finanzas" },

  // Moda / Accesorios
  { name: "Shirt", label: "Camisa", icon: Shirt, category: "Moda" },
  { name: "Watch", label: "Reloj", icon: Watch, category: "Moda" },
  { name: "Glasses", label: "Lentes", icon: Glasses, category: "Moda" },
  { name: "Footprints", label: "Calzado", icon: Footprints, category: "Moda" },

  // Herramientas / Industria
  { name: "Brush", label: "Brocha", icon: Brush, category: "Herramientas" },
  { name: "Palette", label: "Paleta", icon: Palette, category: "Herramientas" },
  { name: "Scissors", label: "Tijeras", icon: Scissors, category: "Herramientas" },
  { name: "Wrench", label: "Llave", icon: Wrench, category: "Herramientas" },
  { name: "Hammer", label: "Martillo", icon: Hammer, category: "Herramientas" },
  { name: "Plug", label: "Enchufe", icon: Plug, category: "Herramientas" },
  { name: "Lightbulb", label: "Foco", icon: Lightbulb, category: "Herramientas" },

  // Tecnología
  { name: "Smartphone", label: "Celular", icon: Smartphone, category: "Tecnología" },
  { name: "Monitor", label: "Monitor", icon: Monitor, category: "Tecnología" },
  { name: "Headphones", label: "Audífonos", icon: Headphones, category: "Tecnología" },
  { name: "Camera", label: "Cámara", icon: Camera, category: "Tecnología" },
  { name: "Printer", label: "Impresora", icon: Printer, category: "Tecnología" },
  { name: "Wifi", label: "WiFi", icon: Wifi, category: "Tecnología" },

  // Ubicación / Contacto
  { name: "Globe", label: "Globo", icon: Globe, category: "General" },
  { name: "Building2", label: "Edificio", icon: Building2, category: "General" },
  { name: "Home", label: "Casa", icon: Home, category: "General" },
  { name: "MapPin", label: "Ubicación", icon: MapPin, category: "General" },
  { name: "Phone", label: "Teléfono", icon: Phone, category: "General" },
  { name: "Mail", label: "Correo", icon: Mail, category: "General" },
  { name: "Clock", label: "Reloj", icon: Clock, category: "General" },
  { name: "Calendar", label: "Calendario", icon: Calendar, category: "General" },

  // Documentos
  { name: "BookOpen", label: "Libro", icon: BookOpen, category: "General" },
  { name: "FileText", label: "Documento", icon: FileText, category: "General" },
  { name: "Clipboard", label: "Portapapeles", icon: Clipboard, category: "General" },
  { name: "PenTool", label: "Pluma", icon: PenTool, category: "General" },

  // Alimentos
  { name: "Coffee", label: "Café", icon: Coffee, category: "Alimentos" },
  { name: "UtensilsCrossed", label: "Cubiertos", icon: UtensilsCrossed, category: "Alimentos" },
  { name: "Wine", label: "Vino", icon: Wine, category: "Alimentos" },
  { name: "Cherry", label: "Cereza", icon: Cherry, category: "Alimentos" },
  { name: "Apple", label: "Manzana", icon: Apple, category: "Alimentos" },
  { name: "Beef", label: "Carne", icon: Beef, category: "Alimentos" },
  { name: "Fish", label: "Pescado", icon: Fish, category: "Alimentos" },
  { name: "Cake", label: "Pastel", icon: Cake, category: "Alimentos" },

  // Mascotas / Varios
  { name: "Baby", label: "Bebé", icon: Baby, category: "Varios" },
  { name: "Cat", label: "Gato", icon: Cat, category: "Varios" },
  { name: "Dog", label: "Perro", icon: Dog, category: "Varios" },
  { name: "Bird", label: "Ave", icon: Bird, category: "Varios" },
  { name: "Bug", label: "Insecto", icon: Bug, category: "Varios" },

  // Formas
  { name: "CircleDot", label: "Punto", icon: CircleDot, category: "Formas" },
  { name: "Hexagon", label: "Hexágono", icon: Hexagon, category: "Formas" },
  { name: "Pentagon", label: "Pentágono", icon: Pentagon, category: "Formas" },
  { name: "Triangle", label: "Triángulo", icon: Triangle, category: "Formas" },
  { name: "Square", label: "Cuadrado", icon: Square, category: "Formas" },
  { name: "Circle", label: "Círculo", icon: Circle, category: "Formas" },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Busca un icono por name en el catálogo */
export function getIconByName(name: string | null | undefined): LucideIcon | null {
  if (!name) return null
  const entry = ICON_CATALOG.find((e) => e.name === name)
  return entry?.icon || null
}

/** Devuelve las categorías disponibles */
function getCategories(): string[] {
  return [...new Set(ICON_CATALOG.map((e) => e.category))]
}

// ─── Componente Principal ────────────────────────────────────────────────────

interface IconPickerProps {
  value?: string
  onChange: (iconName: string) => void
  className?: string
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null)

  const categories = getCategories()

  const filtered = ICON_CATALOG.filter((entry) => {
    const matchesSearch =
      !search.trim() ||
      entry.label.toLowerCase().includes(search.toLowerCase()) ||
      entry.name.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = !activeCategory || entry.category === activeCategory

    return matchesSearch && matchesCategory
  })

  const selectedEntry = ICON_CATALOG.find((e) => e.name === value)
  const SelectedIcon = selectedEntry?.icon || Tag

  const handleSelect = (name: string) => {
    onChange(name)
    setOpen(false)
    setSearch("")
    setActiveCategory(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-3 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            className
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50">
            <SelectedIcon className="size-4" />
          </span>
          <span className="flex-1 text-left truncate">
            {selectedEntry ? selectedEntry.label : "Seleccionar icono"}
          </span>
          <span className="text-xs text-muted-foreground">{value || "Tag"}</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col gap-4 p-0">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle className="text-base">Seleccionar Icono</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-5">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar icono..."
              className="pl-8 pr-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-5 flex gap-1.5 flex-wrap">
          <Button
            type="button"
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs rounded-full px-3"
            onClick={() => setActiveCategory(null)}
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              type="button"
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs rounded-full px-3"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Icon Grid */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No se encontraron iconos para &ldquo;{search}&rdquo;
            </p>
          ) : (
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
              {filtered.map((entry) => {
                const IconComponent = entry.icon
                const isSelected = value === entry.name
                return (
                  <button
                    key={entry.name}
                    type="button"
                    title={`${entry.label} (${entry.name})`}
                    onClick={() => handleSelect(entry.name)}
                    className={cn(
                      "group relative flex flex-col items-center justify-center gap-1 rounded-lg border p-2.5 transition-all",
                      "hover:bg-accent hover:border-accent-foreground/20 hover:shadow-sm hover:text-white",
                      isSelected
                        ? "bg-primary/10 border-primary text-primary ring-1 ring-primary/30"
                        : "border-transparent text-muted-foreground"
                    )}
                  >
                    <IconComponent className="size-5" />
                    <span className="text-[9px] leading-tight truncate w-full text-center opacity-70 group-hover:opacity-100">
                      {entry.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
