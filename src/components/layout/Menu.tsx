"use client";
import { MenuIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMenu } from "@/providers/menu-provider";
import { Menu } from "./sidebar/Menu";

type MenuProps = {
  userId?: string;
  userRoles?: string[] | null | undefined;
};

const MobileButton: React.FC<MenuProps> = ({ userId }) => {
  const { isSheetOpen, setIsSheetOpen } = useMenu();

  return (
    <div className="block xl:hidden">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant={"ghost"} onClick={() => setIsSheetOpen((prev) => !prev)}>
            <span className="">
              <MenuIcon className="h-[1.2rem] w-[1.2rem] xl:hidden opacity-90 hover:opacity-100 transition-all duration-300 hover:cursor-pointer" />
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side={"left"} className={cn("top-0 z-50 w-72 max-w-[calc(100%-3rem)] px-3 pt-6")}>
          <SheetTitle className="hidden">Menu</SheetTitle>
          <SheetDescription className="hidden">Menu</SheetDescription>
          <Menu userId={userId} onClose={() => setIsSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export { Menu, MobileButton };
