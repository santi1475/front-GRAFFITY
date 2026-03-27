import { LucideIcon } from "lucide-react";
import type { RouteType } from "./index";

export type MenuItemType = {
  key: string;
  label: string;
  isTitle?: boolean;
  icon?: LucideIcon | string;
  route?: RouteType;
  url?: string;
  badge?: {
    variant: string;
    text: string;
  };
  parentKey?: string;
  target?: string;
  disabled?: boolean;
  children?: MenuItemType[];
  permission?: string;
  permissions?: string[];
};
 
export type SubMenuProps = {
  item: MenuItemType;
  linkClassName?: string;
  subMenuClassName?: string;
  className?: string;
};
