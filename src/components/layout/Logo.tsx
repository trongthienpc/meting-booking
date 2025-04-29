import Image from "next/image";
import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href={"/"}
      className="transition-all duration-500 ease-linear text-xl drop-shadow-md  px-2 py-1 hover:transition-all hover:duration-500 hover:ease-in-out"
    >
      <Image src={"/logo-vuong.png"} alt="logo" style={{ objectFit: "cover" }} priority width={50} height={50} />
    </Link>
  );
};

export default Logo;
