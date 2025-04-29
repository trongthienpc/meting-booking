import React from "react";
import Logo from "./Logo";
import { validateRequest } from "@/lib/lucia";
import Profile from "./Profile";
import { ModeToggle } from "../ui/mode-toggle";
import { MobileButton } from "./Menu";
import { NotificationBell } from "../notifications/notification-bell";

const Header = async () => {
  const { user } = await validateRequest();
  return (
    <div className="w-full h-full flex items-center gap-3">
      <div className="flex items-center gap-3">
        <span className="hidden md:block">
          <Logo />
        </span>
        {user && <MobileButton userId={user?.username} />}
      </div>
      <div className="flex justify-end w-full items-center gap-3">
        <NotificationBell />
        {/* <Search /> */}
        <ModeToggle />
        {/* <Notifications /> */}
        <Profile />
      </div>
    </div>
  );
};

export default Header;
