import { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { MobileScannerFeature } from '@/feature/mobile-scanner'

export const metadata: Metadata = {
  title: 'POS Mobile Scanner - Iniciar Sesión',
  description: 'Lector Inalámbrico para Punto de Venta',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
}

export default function MobileScannerPage() {
  return (
    <Suspense fallback={
      <div className="flex bg-black min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    }>
      <MobileScannerFeature />
    </Suspense>
  )
}
