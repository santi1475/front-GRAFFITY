import ProductsFeature from "@/feature/products";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Registrar Producto | System Graf",
  description: "Registre nuevos productos con el servicio de escaneo integrado.",
};

export default function ProductRegisterPage() {
  return (
    <Suspense fallback={
        <div className="flex flex-col gap-6 p-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-[400px] w-full" />
        </div>
    }>
      <ProductsFeature initialOpen={true} />
    </Suspense>
  );
}
