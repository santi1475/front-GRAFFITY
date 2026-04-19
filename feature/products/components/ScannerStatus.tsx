"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, ScanLine } from "lucide-react"
import { cn } from "@/lib/utils"

import { QRCodeSVG } from "qrcode.react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ScannerStatusProps {
  isConnected: boolean
  lastScanned?: string | null
  channelUuid?: string
}

export function ScannerStatus({ isConnected, lastScanned, channelUuid }: ScannerStatusProps) {
  const [pulse, setPulse] = React.useState(false)
  const [qrUrl, setQrUrl] = React.useState("")

  React.useEffect(() => {
    if (channelUuid) {
      const base = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')
      if (base) {
        setQrUrl(`${base}/mobile-scanner?channel=${channelUuid}`)
      }
    }
  }, [channelUuid])

  React.useEffect(() => {
    if (lastScanned) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [lastScanned])

  return (
    <div className="flex items-center gap-3">
      {channelUuid ? (
        <Popover>
          <PopoverTrigger asChild>
            <div className="relative cursor-pointer hover:opacity-80 transition-opacity" title="Ver QR de conexión">
              <Badge 
                variant="outline" 
                className={cn(
                  "transition-all duration-500 pl-7 pr-3 py-1 border-white/10 backdrop-blur-md",
                  isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
                  pulse && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-background scale-105"
                )}
              >
                <span className="absolute left-2 top-1/2 -translate-y-1/2">
                  {isConnected ? (
                    <Wifi className="h-3.5 w-3.5 animate-pulse" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5" />
                  )}
                </span>
                {isConnected ? "Escaner Activo" : "Escaner Desconectado"}
              </Badge>
              
              {pulse && (
                <div className="absolute -inset-1 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-auto p-4 bg-background/95 backdrop-blur-xl border-white/10">
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm font-semibold">Escáner Móvil</p>
              <p className="text-xs text-muted-foreground w-48">
                Escanea este código con tu celular para usarlo como lector de códigos de barra.
              </p>
              <div className="p-2 bg-white rounded-md mt-2">
                <QRCodeSVG
                  value={qrUrl}
                  size={150}
                  level="H"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <div className="relative">
          <Badge 
            variant="outline" 
            className={cn(
              "transition-all duration-500 pl-7 pr-3 py-1 border-white/10 backdrop-blur-md",
              isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
              pulse && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-background scale-105"
            )}
          >
            <span className="absolute left-2 top-1/2 -translate-y-1/2">
              {isConnected ? (
                <Wifi className="h-3.5 w-3.5 animate-pulse" />
              ) : (
                <WifiOff className="h-3.5 w-3.5" />
              )}
            </span>
            {isConnected ? "Escaner Activo" : "Escaner Desconectado"}
          </Badge>
          
          {pulse && (
            <div className="absolute -inset-1 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
          )}
        </div>
      )}

      {lastScanned && (
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground animate-in fade-in slide-in-from-left-2">
          <ScanLine className="h-3 w-3" />
          <span>Último: {lastScanned}</span>
        </div>
      )}
    </div>
  )
}
