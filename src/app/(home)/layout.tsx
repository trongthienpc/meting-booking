import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { validateRequest } from "@/lib/lucia";
import { BookingProvider } from "@/providers/booking-provider";
import { MenuProvider } from "@/providers/menu-provider";
import { NotificationProvider } from "@/providers/notification-provider";
import { PusherProvider } from "@/providers/pusher-provider";
import QueryProvider from "@/providers/query-provider";
import { RoomProvider } from "@/providers/room-provider";
import SessionProvider from "@/providers/session-provider";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const HomeLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await validateRequest();
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");

  if (!session.user) {
    return redirect(
      `/authentication?redirectTo=${encodeURIComponent(pathname ?? "")}`
    );
  }
  return (
    <SessionProvider value={session}>
      <PusherProvider
        appKey={process.env.NEXT_PUBLIC_PUSHER_KEY!}
        options={{
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
          forceTLS: true,
        }}
      >
        <NotificationProvider>
          <QueryProvider>
            <RoomProvider>
              <BookingProvider>
                <div className="w-full min-h-screen flex flex-col px-3 md:px-4 lg:px-6 xl:px-12 2xl:px-16 font-light">
                  <MenuProvider>
                    <div className="w-full h-20 bg-transparent bg-opacity-50 backdrop-blur-md fixed left-0 top-0 z-50 px-3 md:px-6 lg:px-9 xl:px-12">
                      <Header />
                    </div>
                    {/* <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-5rem)] pt-20"> */}
                    <div className="flex-1 flex flex-col lg:flex-row min-h-screen pt-20">
                      <div className="hidden xl:block lg:w-72">
                        <Sidebar />
                      </div>
                      <main className="flex flex-col flex-1 w-full overflow-hidden  p-3 md:p-6 ">
                        <div className="flex-1">{children}</div>
                        <div className="h-14 w-full flex items-end justify-center mt-auto ">
                          <Footer />
                        </div>
                      </main>
                    </div>
                  </MenuProvider>
                </div>
                <NotificationListener />
              </BookingProvider>
            </RoomProvider>
          </QueryProvider>
        </NotificationProvider>
      </PusherProvider>
    </SessionProvider>
  );
};

export default HomeLayout;
