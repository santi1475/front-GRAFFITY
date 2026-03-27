'use client';
import { useMemo } from 'react';
import { useAuthStore } from "@/store/auth";
import { menu_item } from '@/assets/data/menu-items';
import type { MenuItemType } from '@/types/menu';

export const useMenuItems = () => {
  const { isPermitedRoute } = useAuthStore();
  
  const menuItems = useMemo(() => {
    const filteredItems: MenuItemType[] = [];

    menu_item.forEach((MENU) => {
      if (MENU.route && MENU.permission) {
        const IS_PERMITED = isPermitedRoute(MENU.permission);
        if (IS_PERMITED) {
          filteredItems.push(MENU);
        }
      } else if (MENU.children) {
        const SUB_MENUS: MenuItemType[] = [];
        MENU.children.forEach((children) => {
          const IS_PERMITED = children.permission ? isPermitedRoute(children.permission) : false;
          if (IS_PERMITED) {
            SUB_MENUS.push(children);
          }
        });
        if (SUB_MENUS.length > 0) {
          filteredItems.push({
            ...MENU,
            children: SUB_MENUS,
          });
        }
      } else {
        if (MENU.permissions) {
          const headingF = MENU.permissions.filter((permission) => {
            return isPermitedRoute(permission);
          });
          if (headingF.length > 0) {
            filteredItems.push(MENU);
          }
        } else {
          filteredItems.push(MENU);
        }
      }
    });
    
    return filteredItems;
  }, [isPermitedRoute]); 

  return { menuItems };
};

export const findAllParent = (
  menuItems: MenuItemType[],
  menuItem: MenuItemType,
): string[] => {
  let parents: string[] = [];
  const parent = findMenuItem(menuItems, menuItem.parentKey);
  if (parent) {
    parents.push(parent.key);
    if (parent.parentKey) {
      parents = [...parents, ...findAllParent(menuItems, parent)];
    }
  }
  return parents;
};

export const getMenuItemFromURL = (
  items: MenuItemType | MenuItemType[],
  url: string,
): MenuItemType | undefined => {
  if (items instanceof Array) {
    for (const item of items) {
      const foundItem = getMenuItemFromURL(item, url);
      if (foundItem) {
        return foundItem;
      }
    }
  } else {
    if (items.url == url) return items;
    if (items.children != null) {
      for (const item of items.children) {
        if (item.url == url) return item;
      }
    }
  }
};

export const findMenuItem = (
  menuItems: MenuItemType[] | undefined,
  menuItemKey: MenuItemType["key"] | undefined,
): MenuItemType | null => {
  if (menuItems && menuItemKey) {
    for (const item of menuItems) {
      if (item.key === menuItemKey) {
        return item;
      }
      const found = findMenuItem(item.children, menuItemKey);
      if (found) return found;
    }
  }
  return null;
};