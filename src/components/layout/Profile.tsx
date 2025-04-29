"use client";
import { ChevronDown, User } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/providers/user-provider";
import { logout } from "@/app/actions/user-actions";

const Profile = () => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer">
            <span className="hidden md:flex md:gap-1">
              {user?.displayName}
              <ChevronDown className="text-slate-500 dark:text-slate-300" />
            </span>
            <Button variant={"outline"} size={"icon"} className="md:hidden">
              <User className="text-slate-500 dark:text-slate-300" />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuGroup>
            <Link href={"/profile"}>
              <DropdownMenuItem className="cursor-pointer">
                Thông tin
                <DropdownMenuShortcut>Ctrl+Alt+P</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuGroup>
            {/* <Link href={"/settings"}>
              <DropdownMenuItem className="cursor-pointer">
                Cài đặt
                <DropdownMenuShortcut>Ctrl+Alt+S</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              queryClient.clear();
              logout();
            }}
          >
            Đăng xuất
            <DropdownMenuShortcut>Ctr+Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Profile;
