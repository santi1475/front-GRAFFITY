import { useEffect, useState, useRef, useCallback } from "react"
import type { Product } from "@/types/product"

interface ScannerWebSocketPayload {
  event: string
  barcode: string
  productData: Product
}

export function useScanner(channelUuid: string) {
  const [lastScannedProduct, setLastScannedProduct] = useState<Product | null>(
    null
  )
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const connect = useCallback(() => {
    if (!channelUuid) return

    // Obtener host desde env o usar local (ajustar según tu configuración)
    const host = process.env.NEXT_PUBLIC_WS_HOST || "localhost:8000"
    const wsUrl = `ws://${host}/ws/scan/${channelUuid}/`

    console.log(`Connecting WebSocket scanner...: ${wsUrl}`)
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log("Scanner WebSocket connected")
      setIsConnected(true)
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }

    ws.onmessage = (event) => {
      try {
        const payload: ScannerWebSocketPayload = JSON.parse(event.data)
        if (payload.event === "product.scanned" && payload.productData) {
          setLastScannedProduct(payload.productData)
        }
      } catch (err) {
        console.error("Error parsing scanner websocket message", err)
      }
    }

    ws.onclose = () => {
      console.log("Scanner WebSocket disconnected")
      setIsConnected(false)
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = (error) => {
      console.error("Scanner WebSocket error:", error)
      ws.close()
    }

    wsRef.current = ws
  }, [channelUuid])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  // Expose a way to clear the last scanned product if needed
  const clearLastScanned = useCallback(() => {
    setLastScannedProduct(null)
  }, [])

  return {
    lastScannedProduct,
    isConnected,
    clearLastScanned,
  }
}
