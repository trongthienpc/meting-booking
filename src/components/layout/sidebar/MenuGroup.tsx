"use client";
import React, { useEffect, useState } from "react";
import { MenuItem as MenuItemType } from "@/lib/types/menu";
import { MenuItem } from "./MenuItem";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface MenuGroupProps {
  item: MenuItemType;
  onClose?: () => void;
}

export const MenuGroup: React.FC<MenuGroupProps> = ({ item, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isSubmenu = pathname.startsWith(item.href || "/");

  useEffect(() => {
    setIsOpen(isSubmenu);
  }, [isSubmenu]);

  return (
    <div>
      <MenuItem item={item} isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
      <AnimatePresence>
        {isOpen && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {item.children.map((child, index) => (
              <MenuItem key={index} item={child} onClose={onClose} isSubmenu />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
