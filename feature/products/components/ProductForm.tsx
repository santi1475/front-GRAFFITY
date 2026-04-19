"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Product, ProductConfigResponse } from "@/types/product"
import { productService } from "@/services/product"
import { useScanner } from "@/hooks/useScanner"
import { ScannerStatus } from "./ScannerStatus"
import { toast } from "sonner"
import { Package, Scan, Loader2, Image as ImageIcon } from "lucide-react"

const productSchema = z.object({
  title: z.string().min(3, "El nombre es muy corto"),
  sku: z.string().optional(),
  price_general: z.string().min(1, "El precio es requerido"),
  category_id: z.string().min(1, "Seleccione una categoría"),
  brand_id: z.string().min(1, "Seleccione una marca"),
  state: z.boolean(),
  unidad_medida: z.string(),
  stock: z.union([z.string(), z.number()]).refine((val) => Number(val) >= 0, "El stock no puede ser negativo"),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  onSuccess: () => void
  config?: ProductConfigResponse
}

export function ProductForm({ open, onOpenChange, product, onSuccess, config }: ProductFormProps) {
  const isEdit = !!product
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [channelUuid] = React.useState(() => crypto.randomUUID())
  const [previewImage, setPreviewImage] = React.useState<string | null>(null)
  
  const { 
    isConnected, 
    lastScannedProduct, 
    lastScannedBarcode,
    isNewScanned,
    clearLastScanned 
  } = useScanner(channelUuid)

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      sku: "",
      price_general: "",
      category_id: "",
      brand_id: "",
      state: true,
      unidad_medida: "Unidad",
      stock: 0,
    },
  })

  // Rehidratar cuando cambia el producto o abre el sheet
  React.useEffect(() => {
    if (open) {
      if (product) {
        reset({
          title: product.title,
          sku: product.sku,
          price_general: String(product.price_general),
          category_id: String(product.category_id || ""),
          brand_id: String(product.brand_id || ""),
          state: !!product.state,
          unidad_medida: product.unidad_medida || "Unidad",
          stock: product.stock || 0,
        })
        setPreviewImage(product.image ? `${process.env.NEXT_PUBLIC_API_URL}${product.image}` : null)
      } else {
        reset({
          title: "",
          sku: "",
          price_general: "",
          category_id: "",
          brand_id: "",
          state: true,
          unidad_medida: "Unidad",
          stock: 0,
        })
        setPreviewImage(null)
      }
    }
  }, [open, product, reset])

  // Lógica de detección de escáner físico (Hardware)
  React.useEffect(() => {
    let buffer = ""
    let lastKeyTime = Date.now()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      const currentTime = Date.now()
      
      if (e.key === "Enter") {
        if (buffer.length > 5) {
          toast.info(`Escaneo físico detectado: ${buffer}`)
          productService.scanProduct({ barcode: buffer, channel_uuid: channelUuid })
        }
        buffer = ""
        return
      }

      // Evitar teclas de control
      if (e.key.length === 1) {
        // Los lectores típicamente mandan cada tecla muy rápido (usualmente < 15ms)
        // Damos maximo 30ms para considerarlo parte del mismo escaneo automático.
        if (currentTime - lastKeyTime > 30) {
          buffer = e.key
        } else {
          buffer += e.key
        }
        lastKeyTime = currentTime
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, channelUuid])

  // Manejar el resultado del escaneo (vía WebSocket)
  React.useEffect(() => {
    // Escenario 1: Código no registrado (Nuevo)
    if (isNewScanned && lastScannedBarcode) {
      toast.info(`Código nuevo detectado: ${lastScannedBarcode}`)
      if (!isEdit) {
        setValue("sku", lastScannedBarcode, { shouldValidate: true })
      }
      clearLastScanned()
      return
    }

    // Escenario 2: Producto ya registrado
    if (lastScannedProduct) {
      if (isEdit && lastScannedProduct.id === product?.id) {
          clearLastScanned()
          return
      }

      toast.success(`Detectado: ${lastScannedProduct.title}`)
      if (!isEdit) {
        setValue("sku", lastScannedProduct.sku, { shouldValidate: true })
      }
      clearLastScanned()
    }
  }, [lastScannedProduct, isNewScanned, lastScannedBarcode, isEdit, product, clearLastScanned, setValue])

  const onSubmit = async (values: ProductFormValues) => {
    try {
      setIsSubmitting(true)
      const formData = new FormData()
      
      formData.append("title", values.title)
      formData.append("price_general", values.price_general)
      formData.append("category_id", values.category_id)
      formData.append("brand_id", values.brand_id)
      formData.append("state", values.state ? "1" : "0")
      formData.append("unidad_medida", values.unidad_medida)
      formData.append("stock", String(values.stock))

      if (!isEdit && values.sku) {
        formData.append("sku", values.sku)
      }

      const fileInput = document.getElementById("product-image") as HTMLInputElement
      if (fileInput?.files?.[0]) {
        formData.append("image", fileInput.files[0])
      }

      if (isEdit && product) {
        await productService.updateProduct(product.id, formData)
      } else {
        await productService.createProduct(formData)
      }

      toast.success(isEdit ? "Producto actualizado" : "Producto registrado")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error("Error al procesar el producto")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full max-h-screen w-full flex-col gap-0 p-0 sm:max-w-130 glass-morphism border-white/10 bg-background/95 backdrop-blur-xl">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 shrink-0">
                <Package size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <SheetTitle className="text-lg font-semibold leading-snug">
                  {isEdit ? "Editar Producto" : "Nuevo Producto"}
                </SheetTitle>
                <SheetDescription className="text-sm mt-0.5 leading-relaxed">
                  {isEdit ? "Modifica los detalles del producto." : "Añade un nuevo producto escaneando su código."}
                </SheetDescription>
              </div>
            </div>
            <ScannerStatus isConnected={isConnected} channelUuid={channelUuid} />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-6">
            <div className="space-y-4">
              {/* Preview e Imagen */}
              <div className="flex flex-col items-center justify-center space-y-3 pb-4">
                <div className="relative h-32 w-32 rounded-xl border-2 border-dashed border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                  )}
                  <input
                    type="file"
                    id="product-image"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Pulse la imagen para subir (Máx. 2MB)</p>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nombre del Producto *</label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ej: Pintura Graffiti Pro"
                      className={errors.title ? "border-destructive bg-white/5" : "bg-white/5 border-white/10"}
                    />
                  )}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* SKU */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    SKU / Código {isEdit && <span className="text-[10px] text-yellow-500">(Fijo)</span>}
                  </label>
                  <Controller
                    name="sku"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Input 
                          {...field} 
                          disabled={isEdit} 
                          placeholder="Escanear..." 
                          className="bg-white/5 border-white/10 pr-10" 
                        />
                        <Scan className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                      </div>
                    )}
                  />
                </div>

                {/* Precio */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Precio General *</label>
                  <Controller
                    name="price_general"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        className={errors.price_general ? "border-destructive bg-white/5" : "bg-white/5 border-white/10"}
                      />
                    )}
                  />
                  {errors.price_general && <p className="text-xs text-destructive">{errors.price_general.message}</p>}
                </div>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Categoría *</label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 backdrop-blur-md border-white/10">
                        {config?.categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>{cat.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Marca *</label>
                <Controller
                  name="brand_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 backdrop-blur-md border-white/10">
                        {config?.brands.map(brand => (
                          <SelectItem key={brand.id} value={String(brand.id)}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.brand_id && <p className="text-xs text-destructive">{errors.brand_id.message}</p>}
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Stock *</label>
                <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      className={errors.stock ? "border-destructive bg-white/5" : "bg-white/5 border-white/10"}
                    />
                  )}
                />
                {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
              </div>

              {/* Estado */}
              <div className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4 bg-white/5">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold text-foreground">Estado Activo</label>
                  <p className="text-xs text-muted-foreground">Visible en facturación</p>
                </div>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="shrink-0 px-6 py-4 border-t border-border/60 bg-muted/20 flex flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            form="product-form" 
            disabled={isSubmitting} 
            className="flex-1 sm:flex-none shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              isEdit ? "Actualizar Producto" : "Registrar Producto"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
