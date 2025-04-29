import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MenuItem as MenuItemType } from "@/lib/types/menu";

interface MenuItemProps {
  item: MenuItemType;
  isSubmenu?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ item, isSubmenu = false, isOpen, onToggle, onClose }) => {
  const pathname = usePathname();
  const Icon = item.icon;
  // const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const isActive = pathname === item.href;

  return (
    <Link
      prefetch
      href={item.href}
      onClick={(e) => {
        if (item.children?.length) {
          e.preventDefault();
          onToggle?.();
        } else {
          onClose?.();
        }
      }}
      className={cn(
        "p-1 group flex items-center mb-2 font-medium",
        isSubmenu && "pl-10",
        isActive
          ? "text-teal-600 dark:text-teal-400"
          : "text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300"
      )}
    >
      <div className="mr-4 p-1 rounded-md ring-1 ring-slate-900/5 shadow-sm group-hover:shadow group-hover:ring-slate-900/10 dark:ring-0 dark:shadow-none dark:group-hover:shadow-none dark:group-hover:highlight-white/10 group-hover:shadow-teal-500 dark:group-hover:bg-violet-700 dark:bg-slate-700 dark:highlight-white/5">
        <Icon className="w-[1rem] h-[1rem]" />
      </div>
      <span className="flex-1">{item.label}</span>
      {item.children?.length && (
        <svg
          className={cn("w-4 h-4 transition-transform duration-200", isOpen ? "transform rotate-180" : "")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </Link>
  );
};
