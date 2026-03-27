"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { menu_item } from "@/assets/data/menu-items";
import type { MenuItemType } from "@/types/menu";

export const useMenuItems = () => {
  const { isPermitedRoute } = useAuthStore();
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const menuItems = useMemo(() => {
    // Mantiene el mismo árbol en SSR y en la hidratación inicial del cliente.
    if (!isClientReady) {
      return menu_item;
    }

    const filteredItems: MenuItemType[] = [];

    menu_item.forEach((item) => {
      // Ítem con ruta directa y permiso único
      if (item.route && item.permission) {
        if (isPermitedRoute(item.permission)) {
          filteredItems.push(item);
        }
        return;
      }

      // Ítem con hijos → filtrar cada hijo individualmente
      if (item.children) {
        const allowedChildren = item.children.filter((child) =>
          child.permission ? isPermitedRoute(child.permission) : false,
        );
        if (allowedChildren.length > 0) {
          filteredItems.push({ ...item, children: allowedChildren });
        }
        return;
      }

      // Títulos de sección con múltiples permisos
      if (item.permissions) {
        const hasAny = item.permissions.some((p) => isPermitedRoute(p));
        if (hasAny) filteredItems.push(item);
        return;
      }

      // Sin restricciones → siempre visible
      filteredItems.push(item);
    });

    return filteredItems;
  }, [isPermitedRoute, isClientReady]);

  return { menuItems };
};