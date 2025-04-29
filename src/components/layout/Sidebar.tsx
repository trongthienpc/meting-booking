import React from "react";
import { Menu } from "./Menu";

const Sidebar = () => {
  return (
    <div className="h-full flex flex-col flex-1 justify-between xl:border-r ">
      <Menu />
    </div>
  );
};

export default Sidebar;
