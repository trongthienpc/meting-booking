import { LucideIcon } from "lucide-react";

export interface MenuItem {
  href: string;
  icon: LucideIcon;
  label: string;
  requiredRole: string[];
  children?: MenuItem[];
}
