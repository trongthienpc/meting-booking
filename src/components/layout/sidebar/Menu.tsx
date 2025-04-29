"use client";
import React from "react";
import { MenuGroup } from "./MenuGroup";
import Logo from "../Logo";
import { menuItems } from "./MenuItems";
interface MenuProps {
  userId?: string;
  userRoles?: string[] | null | undefined;
  onClose?: () => void;
}

export const Menu: React.FC<MenuProps> = ({ onClose }) => {
  return (
    <div className="h-full  py-6">
      <div className="py-6 lg:hidden">
        <Logo />
      </div>
      <ul className="space-y-1">
        {menuItems.map((item, index) => (
          <li key={index} className="pr-3">
            <MenuGroup item={item} onClose={onClose} />
          </li>
        ))}
      </ul>
    </div>
  );
};
