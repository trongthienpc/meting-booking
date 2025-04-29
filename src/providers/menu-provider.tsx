"use client";
import React, { Dispatch, SetStateAction, useContext } from "react";

export type MenuContextType = {
  isSheetOpen: boolean;
  setIsSheetOpen: Dispatch<SetStateAction<boolean>>;
};

export const MenuContext = React.createContext<MenuContextType>({
  isSheetOpen: false,
  setIsSheetOpen: () => {},
});

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  return (
    <MenuContext.Provider
      value={{
        isSheetOpen,
        setIsSheetOpen,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("useMenu must be used within a MenuProvider");
  }

  return context;
};
