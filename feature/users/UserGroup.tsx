"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user";
import { User } from "@/types/user";
import { useAuthStore } from "@/store/auth";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Nota: Puedes agregar un select para rol y género si tienes componentes predefinidos. Usaremos `select` html por defecto u omitiremos si falta el de shadcn temporalmente. 
// Aquí lo armaremos nativo con estilos Tailwind para simplificar, pero adaptado al ecosistema.

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  surname: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().optional(),
  type_document: z.string().optional(),
  n_document: z.string().optional(),
  phone: z.string().optional(),
  gender: z.number().optional(),
  role_id: z.number().min(1, "Seleccione un rol"),
  is_active: z.boolean(),
  avatar: z
    .any()
    .optional()
    .refine((file) => !file || file?.size <= MAX_FILE_SIZE, `El tamaño máximo es de 5MB.`)
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Solo se permiten formatos .jpg, .jpeg, .png y .webp"
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  roles: { id: number; name: string }[];
}

export function UserFormSheet({ open, onOpenChange, user, roles }: UserFormSheetProps) {
  const queryClient = useQueryClient();
  const { user: authUser, updateUser } = useAuthStore();
  const [preview, setPreview] = useState<string | null>(null);
  const defaultAvatarSrc = user?.avatar
    ? (user.avatar.includes("http") ? user.avatar : `http://localhost:8000${user.avatar}`)
    : null;
  const previewSrc = preview ?? defaultAvatarSrc;

  const handleSheetOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setPreview(null);
    }
    onOpenChange(nextOpen);
  };

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      type_document: "",
      n_document: "",
      phone: "",
      gender: 1,
      role_id: 0,
      is_active: true,
      avatar: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          name: user.name,
          surname: user.surname,
          email: user.email,
          password: "", // Contraseña vacía por seguridad
          type_document: user.type_document || "",
          n_document: user.n_document || "",
          phone: user.phone || "",
          gender: user.gender || 1,
          role_id: user.role_id || (roles[0]?.id || 0),
          is_active: user.is_active,
          avatar: undefined,
        });
      } else {
        reset({
          name: "",
          surname: "",
          email: "",
          password: "",
          type_document: "",
          n_document: "",
          phone: "",
          gender: 1,
          role_id: roles[0]?.id || 0,
          is_active: true,
          avatar: undefined,
        });
      }
    }
  }, [open, user, reset, roles]);

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => {
        // Removemos password si es actualización y está vacía
        if (user && !values.password) {
            delete values.password;
        }
        return userService.saveUser(values, user?.id);
    },
    onSuccess: (response: unknown) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      // Si el usuario editado es el mismo que está logueado, actualizamos el store global
      const updatedUser = (response as { user?: unknown }).user;
      if (user && authUser && user.id === authUser.id && updatedUser) {
          updateUser(updatedUser as Parameters<typeof updateUser>[0]);
      }

      handleSheetOpenChange(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    saveMutation.mutate(data);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar", file, { shouldValidate: true });
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent className="flex h-full max-h-screen w-full flex-col gap-0 p-0 sm:max-w-130">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-2 shrink-0">
              <UserIcon size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-lg font-semibold leading-snug">
                {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
              </SheetTitle>
              <SheetDescription className="text-sm mt-0.5 leading-relaxed">
                {user ? "Configura los datos y permisos de acceso para este usuario." : "Añade un nuevo usuario y asígnale su rol."}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <form id="user-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-6">
                
                {/* Avatar Preview */}
                <div className="flex flex-col items-center justify-center space-y-3">
                    <Avatar className="h-24 w-24 border">
                      {previewSrc ? <AvatarImage src={previewSrc} alt="Preview" className="object-cover" /> : null}
                        <AvatarFallback className="bg-muted text-xl">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    
                    <div className="text-center">
                        <label className="cursor-pointer">
                            <span className="text-sm font-medium text-primary hover:underline">Cambiar foto de perfil</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                        </label>
                        {errors.avatar && <p className="text-xs text-destructive mt-1">{errors.avatar.message as string}</p>}
                    </div>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-1">
                        <label className="text-sm font-semibold text-foreground">Nombre</label>
                        <Controller name="name" control={control} render={({ field }) => (
                            <Input {...field} value={field.value ?? ""} className={errors.name ? "border-destructive" : ""} />
                        )} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    
                    <div className="space-y-2 col-span-1">
                        <label className="text-sm font-semibold text-foreground">Apellidos</label>
                        <Controller name="surname" control={control} render={({ field }) => (
                            <Input {...field} value={field.value ?? ""} className={errors.surname ? "border-destructive" : ""} />
                        )} />
                        {errors.surname && <p className="text-xs text-destructive">{errors.surname.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Correo Electrónico / Ingreso</label>
                    <Controller name="email" control={control} render={({ field }) => (
                        <Input type="email" {...field} value={field.value ?? ""} className={errors.email ? "border-destructive" : ""} />
                    )} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                        Contraseña {user && <span className="text-xs font-normal text-muted-foreground mr-2">(Dejar en blanco para mantener)</span>}
                    </label>
                    <Controller name="password" control={control} render={({ field }) => (
                        <Input type="password" {...field} value={field.value ?? ""} />
                    )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-1">
                        <label className="text-sm font-semibold text-foreground">Teléfono</label>
                        <Controller name="phone" control={control} render={({ field }) => (
                            <Input {...field} value={field.value ?? ""} />
                        )} />
                    </div>
                    <div className="space-y-2 col-span-1">
                        <label className="text-sm font-semibold text-foreground">Género</label>
                        <Controller name="gender" control={control} render={({ field }) => (
                            <select 
                                {...field} 
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                                <option value={1}>Masculino</option>
                                <option value={2}>Femenino</option>
                            </select>
                        )} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Rol Asignado</label>
                    <Controller name="role_id" control={control} render={({ field }) => (
                        <select 
                            {...field} 
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <option value={0} disabled>Seleccione un rol</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    )} />
                    {errors.role_id && <p className="text-xs text-destructive">{errors.role_id.message}</p>}
                </div>

            </div>
          </form>
        </div>

        <SheetFooter className="shrink-0 px-6 py-4 border-t border-border/60 bg-muted/20 flex flex-row gap-2 sm:justify-end">
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => handleSheetOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" disabled={saveMutation.isPending} className="flex-1 sm:flex-none">
            {saveMutation.isPending ? "Guardando..." : "Guardar Usuario"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
