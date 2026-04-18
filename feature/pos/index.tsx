"use client";

import { useMemo, useState, useEffect } from "react";
import { useScanner } from "@/hooks/useScanner";
import type { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart } from "lucide-react";
import { productService } from "@/services/product";

interface CartItem extends Product {
  quantity: number;
}

export default function POSViewContainer() {
  // En un entorno real, generas un UUID único por sesión de caja y lo guardas en localStorage o estado global
  const [channelUuid] = useState(() => crypto.randomUUID());
  
  const { isConnected, lastScannedProduct, clearLastScanned } = useScanner(channelUuid);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Estado para el listener global del escáner físico
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [lastKeyTime, setLastKeyTime] = useState(Date.now());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en un input manualmente
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentTime = Date.now();
      
      // El lector envía un Enter al final de la lectura
      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 3) {
          // Disparamos la petición HTTP para registrar el escaneo
          productService.scanProduct({ barcode: barcodeBuffer, channel_uuid: channelUuid })
            .catch(err => console.error("Error enviando scan", err));
        }
        setBarcodeBuffer("");
        return;
      }

      // Evitar teclas de control o especiales
      if (e.key.length === 1) {
        // Los lectores de código de barras escriben rapidísimo (menos de 50ms entre teclas)
        if (currentTime - lastKeyTime > 50) {
          setBarcodeBuffer(e.key); // Nueva lectura, iniciamos buffer
        } else {
          setBarcodeBuffer(prev => prev + e.key); // Sigue leyendo muy rápido
        }
        setLastKeyTime(currentTime);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [barcodeBuffer, lastKeyTime, channelUuid]);


  useEffect(() => {
    if (lastScannedProduct) {
      setCart((prevCart) => {
        const index = prevCart.findIndex(item => item.id === lastScannedProduct.id);
        if (index >= 0) {
          const newCart = [...prevCart];
          newCart[index].quantity += 1;
          return newCart;
        } else {
          return [...prevCart, { ...lastScannedProduct, quantity: 1 }];
        }
      });
      clearLastScanned(); // Importante para que el hook pueda emitir el mismo producto de nuevo
    }
  }, [lastScannedProduct, clearLastScanned]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (parseFloat(item.price_general || "0") * item.quantity), 0);
  }, [cart]);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> 
          Punto de Venta (Caja)
        </h1>
        <div>
          {isConnected ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              Escáner Conectado
            </Badge>
          ) : (
            <Badge variant="destructive">
              Escáner Desconectado
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Carrito de Compras</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Cód / SKU</TableHead>
                    <TableHead>Precio U.</TableHead>
                    <TableHead>Cant.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                        Pase un producto por el escáner para comenzar
                      </TableCell>
                    </TableRow>
                  ) : (
                    cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>S/ {parseFloat(item.price_general || "0").toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          S/ {(parseFloat(item.price_general || "0") * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  S/ {total.toFixed(2)}
                </span>
              </div>
              <div className="space-y-4">
                 <p className="text-xs text-muted-foreground text-center">
                    (UUID Canal: <span className="font-mono">{channelUuid.split("-")[0]}...</span>)
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
