import { APP_VERSION } from "@/lib/constants";
import React from "react";

const Footer = () => {
  return (
    <div className="flex flex-1 justify-end items-center">
      <span className="text-xs text-muted-foreground">Builded by @_@ 2t team version {APP_VERSION}</span>
    </div>
  );
};

export default Footer;
