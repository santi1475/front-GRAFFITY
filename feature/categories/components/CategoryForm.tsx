"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { categoryService } from "@/services/category"
import { toast } from "sonner"
import { Category } from "@/types/category"
import { Switch } from "@/components/ui/switch"
import { IconPicker } from "@/components/ui/icon-picker"
import { LayoutGrid } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"]

const formSchema = z.object({
  title: z.string().min(1, "El nombre es obligatorio").max(255, "Máximo 255 caracteres"),
  icon_name: z.string().optional(),
  is_active: z.boolean(),
  image: z
    .any()
    .optional()
    .refine((file) => {
      if (!file || typeof file === "string") return true
      return file?.size <= MAX_FILE_SIZE
    }, "El tamaño máximo es de 2MB.")
    .refine((file) => {
      if (!file || typeof file === "string") return true
      return ACCEPTED_IMAGE_TYPES.includes(file.type)
    }, "Solo se permiten formatos .jpg, .jpeg, .png, .webp o .svg"),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  category?: Category
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void  // 👈 Agregar esta prop
}

export function CategoryForm({ category, open, onOpenChange, onSuccess }: CategoryFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEdit = !!category

  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    category?.image ? `${process.env.NEXT_PUBLIC_API_URL}${category.image}` : null
  )

  const { control, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: category?.title || "",
      icon_name: category?.icon_name || "LayoutGrid", // Uses LayoutGrid instead of Tag as fallback
      is_active: category?.is_active ?? true,
      image: undefined,
    },
  })

  React.useEffect(() => {
    if (open) {
      reset({
        title: category?.title || "",
        icon_name: category?.icon_name || "LayoutGrid",
        is_active: category?.is_active ?? true,
        image: undefined,
      })
      setPreviewUrl(category?.image ? `${process.env.NEXT_PUBLIC_API_URL}${category.image}` : null)
    }
  }, [category, open, reset])

  const saveMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      const payload: any = {
        title: values.title,
        icon_name: values.icon_name,
        is_active: values.is_active ? "True" : "False",
      }

      if (values.image instanceof File) {
        payload.image = values.image
      }

      if (isEdit) {
        return categoryService.updateCategory(category!.id, payload)
      }
      return categoryService.createCategory(payload)
    },
    onSuccess: () => {
      toast.success(isEdit ? "Categoría actualizada correctamente" : "Categoría creada correctamente")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      onOpenChange(false)
      onSuccess?.()  // 👈 Llamar al callback
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Ocurrió un error al guardar la categoría"
      toast.error(msg)
    },
  })

  const onSubmit = (data: CategoryFormValues) => {
    saveMutation.mutate(data)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue("image", file, { shouldValidate: true })
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 gap-0 w-full sm:max-w-[520px] h-full max-h-screen">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-2 shrink-0">
              <LayoutGrid size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-lg font-semibold leading-snug">
                {isEdit ? "Editar Categoría" : "Registrar Categoría"}
              </SheetTitle>
              <SheetDescription className="text-sm mt-0.5 leading-relaxed">
                {isEdit ? "Modifica los detalles de la categoría." : "Añade una nueva categoría al catálogo."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form id="category-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-6">
              
              {/* Image Upload */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 bg-muted/20 overflow-hidden">
                  {previewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <LayoutGrid className="size-8 text-muted-foreground/40" />
                  )}
                </div>
                <div className="text-center">
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:underline">
                      {previewUrl ? "Cambiar imagen" : "Subir imagen"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.webp,.svg"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-1">SVG, PNG o JPG (Máx. 2MB)</p>
                  {errors.image && <p className="text-xs text-destructive mt-1">{errors.image.message as string}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Nombre de la Categoría *</label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ej. Electrodomésticos"
                      className={errors.title ? "border-destructive" : ""}
                    />
                  )}
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Icono de la categoría</label>
                <Controller
                  name="icon_name"
                  control={control}
                  render={({ field }) => (
                    <IconPicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <label className="text-sm font-semibold text-foreground">Estado Activo</label>
                  <p className="text-xs text-muted-foreground">Ocultar o mostrar en el catálogo</p>
                </div>
                <Controller
                  name="is_active"
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
            form="category-form" 
            disabled={isSubmitting || saveMutation.isPending} 
            className="flex-1 sm:flex-none"
          >
            {saveMutation.isPending ? "Guardando..." : isEdit ? "Actualizar Categoría" : "Crear Categoría"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}