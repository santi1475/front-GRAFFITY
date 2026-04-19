"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { productService } from "@/services/product"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Loader2, AlertTriangle, CameraOff, Lock, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function MobileScannerFeature() {
  const searchParams = useSearchParams()
  const channelParam = searchParams.get("channel")
  const [channelUuid, setChannelUuid] = React.useState<string | null>(channelParam)
  
  const [hasScannedLast, setHasScannedLast] = React.useState<string | null>(null)
  const [isSending, setIsSending] = React.useState(false)
  const [cameraError, setCameraError] = React.useState<{ title: string, message: string, type: 'security' | 'permission' | 'not-found' | 'other' } | null>(null)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  React.useEffect(() => {
    if (!channelUuid || !isMounted) return

    // 1. Verificación de Contexto Seguro (HTTPS)
    if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost') {
       setCameraError({
         type: 'security',
         title: 'Conexión No Segura',
         message: 'El acceso a la cámara requiere HTTPS por seguridad del navegador. Usa una URL segura o accede vía localhost.'
       })
       return
    }

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 15, 
        qrbox: { width: 280, height: 160 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.ITF
        ],
        rememberLastUsedCamera: true,
        showTorchButtonIfSupported: true,
      },
      false
    )

    const onScanSuccess = async (decodedText: string) => {
      // Throttling: evitar procesar si ya estamos enviando o si es el mismo código muy rápido
      if (isSending || (hasScannedLast === decodedText)) return

      try {
        setHasScannedLast(decodedText)
        setIsSending(true)

        // Feedback táctil inmediato
        if ("vibrate" in navigator) {
          navigator.vibrate(100)
        }

        // Enviamos al backend que enviara via WebSocket el codigo de barras
        await productService.scanProduct({ barcode: decodedText, channel_uuid: channelUuid })
        
        // Mantener el estado de "exitoso" por un momento antes de permitir el siguiente escaneo
        setTimeout(() => {
          setHasScannedLast(null)
          setIsSending(false)
        }, 2000) // 2 segundos de cooldown para evitar duplicados accidentales
        
      } catch (error) {
        console.error("Error al transmitir codigo:", error)
        setIsSending(false)
        // Pequeña espera antes de reintentar en caso de error
        setTimeout(() => setHasScannedLast(null), 1000)
      }
    }

    const onScanError = (error: any) => {
        // html5-qrcode genera muchos errores "No barcode detected" que se ignoran
        // Solo nos interesan errores críticos de inicialización que suelen venir antes de render
    }

    scanner.render(onScanSuccess, onScanError)

    // Interceptar fallos de permisos o dispositivos no encontrados
    // html5-qrcode no expone errores de render directamente de forma limpia en la promesa, 
    // pero podemos detectar si el elemento tiene contenido de error.
    const checkErrorInterval = setInterval(() => {
        const readerElement = document.getElementById('reader')
        if (readerElement && readerElement.innerText.includes('NotAllowedError')) {
           setCameraError({
             type: 'permission',
             title: 'Permiso Denegado',
             message: 'Has bloqueado el acceso a la cámara. Por favor, habilita los permisos en la configuración de tu navegador.'
           })
           clearInterval(checkErrorInterval)
        } else if (readerElement && readerElement.innerText.includes('NotFoundError')) {
            setCameraError({
                type: 'not-found',
                title: 'Cámara No Detectada',
                message: 'No se encontró ninguna cámara conectada a este dispositivo.'
            })
            clearInterval(checkErrorInterval)
        }
    }, 500)

    return () => {
      clearInterval(checkErrorInterval)
      scanner.clear().catch(console.error)
    }
  }, [channelUuid, isSending, hasScannedLast, isMounted])

  if (!channelUuid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-red-500">Error de Conexión</h2>
        <p className="text-muted-foreground">URL Inválida. Por favor, vuelva a escanear el Código QR desde su computadora.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
      <div className="flex flex-col items-center justify-center p-6 bg-neutral-900 absolute top-0 w-full z-10 border-b border-white/10">
        <h1 className="text-lg font-bold">Lector Inalámbrico POS</h1>
        <p className="text-xs text-neutral-400">Canal: {channelUuid.split("-")[0]}...</p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center mt-20 px-4">
        {cameraError ? (
           <Card className="w-full max-w-sm bg-neutral-900 border-red-500/50 text-white">
             <CardHeader className="text-center">
               <div className="mx-auto bg-red-500/10 p-3 rounded-full w-fit mb-2">
                 {cameraError.type === 'security' && <Lock className="w-8 h-8 text-red-500" />}
                 {cameraError.type === 'permission' && <AlertTriangle className="w-8 h-8 text-red-500" />}
                 {cameraError.type === 'not-found' && <CameraOff className="w-8 h-8 text-red-500" />}
                 {cameraError.type === 'other' && <AlertTriangle className="w-8 h-8 text-red-500" />}
               </div>
               <CardTitle className="text-xl text-red-500">{cameraError.title}</CardTitle>
               <CardDescription className="text-neutral-400 mt-2">
                 {cameraError.message}
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               {cameraError.type === 'security' && (
                 <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-400">
                    <strong>Tip:</strong> Para pruebas locales usa <code className="bg-black/40 px-1 rounded">localhost</code> o un túnel como <code className="bg-black/40 px-1 rounded">ngrok</code> para obtener HTTPS.
                 </div>
               )}
               {cameraError.type === 'permission' && (
                 <p className="text-xs text-neutral-500 text-center">
                   Busca el icono de candado o cámara en la barra de direcciones y selecciona "Permitir siempre".
                 </p>
               )}
             </CardContent>
             <CardFooter>
               <Button 
                variant="outline" 
                className="w-full border-white/10 hover:bg-white/5"
                onClick={() => window.location.reload()}
               >
                 <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
               </Button>
             </CardFooter>
           </Card>
        ) : (
          <div 
            id="reader" 
            className="w-full max-w-md mx-auto aspect-square overflow-hidden rounded-2xl border-2 border-white/5 bg-neutral-900/50" 
          />
        )}
      </div>

      {hasScannedLast && (
        <div className="absolute inset-0 bg-emerald-500/80 z-20 flex flex-col items-center justify-center text-white backdrop-blur-sm animate-in fade-in duration-300">
          <ShieldCheck className="w-20 h-20 mb-4" />
          <h2 className="text-2xl font-bold text-center">¡Lectura Exitosa!</h2>
          <p className="mt-2 text-xl font-mono bg-black/20 px-4 py-2 rounded-lg">{hasScannedLast}</p>
          <p className="mt-4 text-sm opacity-80">Enviado a tu computadora...</p>
        </div>
      )}

      {isSending && !hasScannedLast && (
        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="w-12 h-12 animate-spin text-white" />
        </div>
      )}
    </div>
  )
}
