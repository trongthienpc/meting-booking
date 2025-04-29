// "use server";
import React from "react";
import { redirect } from "next/navigation";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { validateRequest } from "@/lib/lucia";
import { logsQueue } from "@/lib/queue";
import Login from "@/components/login";

export const dynamic = "force-dynamic";

const AuthenticationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) => {
  const session = await validateRequest();
  if (session?.user) {
    return redirect((await searchParams).redirectTo || "/");
  }

  logsQueue.add("authentication", { userId: "anonymous", activity: "login" });
  return (
    <div
      className="w-full h-screen relative"
      // className="bg-[url('/balloon-lg.jpg')] w-full h-screen bg-cover bg-center fixed "
      style={{}}
    >
      {/* <LoginClientComponent redirectTo={searchParams.redirectTo} /> */}
      <BackgroundGradientAnimation />
      <div className="absolute inset-0 flex items-center justify-center px-4 z-50">
        <div className="pointer-events-auto">
          <Login />
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
