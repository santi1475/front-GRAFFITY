"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, ScanLine } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScannerStatusProps {
  isConnected: boolean
  lastScanned?: string | null
}

export function ScannerStatus({ isConnected, lastScanned }: ScannerStatusProps) {
  const [pulse, setPulse] = React.useState(false)

  React.useEffect(() => {
    if (lastScanned) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [lastScanned])

  return (
    <div className="flex items-center gap-3">
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

      {lastScanned && (
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground animate-in fade-in slide-in-from-left-2">
          <ScanLine className="h-3 w-3" />
          <span>Último: {lastScanned}</span>
        </div>
      )}
    </div>
  )
}
