import ProductsFeature from "@/feature/products";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Listado de Productos | System Graf",
  description: "Lista completa de productos con soporte para escaneo de código de barras.",
};

export default function ProductListPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col gap-6 p-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    }>
      <ProductsFeature />
    </Suspense>
  );
}
