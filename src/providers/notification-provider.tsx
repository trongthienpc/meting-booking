/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useTransition, useOptimistic, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useUser } from "./user-provider";
import { EventName } from "@/constants/channels";
import { NotificationModel } from "@/lib/schemas/notification";
import { deleteNotification, getNotifications, markAsRead } from "@/app/actions/notification-action";
import { useChannel } from "./pusher-provider";

type NotificationContextType = {
  notifications?: NotificationModel[];
  unreadCount: number;
  isLoading: boolean;
  error?: Error;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  mutate: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  console.log("🚀 ~ NotificationProvider ~ user:", user);
  const channel = useChannel(user ? `user-${user?.username}` : "");
  const {
    data: notifications = [],
    error,
    mutate,
  } = useSWR(
    user ? ["notifications", user?.username] : null,
    () => getNotifications(user!.username).then((res) => (res.success ? res.data : [])),
    { refreshInterval: 60000 * 5 } // Refresh every 30 seconds
  );

  // Listen to real-time updates
  useEffect(() => {
    if (!channel) return;

    // console.log("Setting up Pusher notification handlers");

    // channel.bind("pusher:subscription_succeeded", () => {
    //   console.log("Successfully subscribed to notification channel");
    // });

    // channel.bind("pusher:subscription_error", (error: any) => {
    //   console.error("Notification channel subscription error:", error);
    // });

    const handleNewNotification = (data: NotificationModel) => {
      // Update notifications list
      mutate((current) => {
        if (!current) return [data];
        // Check if notification already exists to prevent duplicates
        const exists = current.some((n) => n.id === data.id);
        if (exists) return current;
        return [data, ...current];
      }, true); // true = revalidate to ensure consistency
    };

    channel.bind(EventName.UPDATE_LEAVE_REQUEST_EVENT, handleNewNotification);
    channel.bind(EventName.REJECT_LEAVE_REQUEST_EVENT, handleNewNotification);
    channel.bind(EventName.APPROVE_LEAVE_REQUEST_EVENT, handleNewNotification);
    channel.bind(EventName.NEW_LEAVE_REQUEST_EVENT, handleNewNotification);
    channel.bind(EventName.CANCEL_LEAVE_REQUEST_EVENT, handleNewNotification);

    // Debug any events on this channel
    // const handleAllEvents = (eventName: string, data: any) => {
    //   console.log(`Debug - Event received: ${eventName}`, data);
    // };
    // channel.bind_global(handleAllEvents);

    return () => {
      channel.unbind(EventName.UPDATE_LEAVE_REQUEST_EVENT, handleNewNotification);
      channel.unbind(EventName.REJECT_LEAVE_REQUEST_EVENT, handleNewNotification);
      channel.unbind(EventName.APPROVE_LEAVE_REQUEST_EVENT, handleNewNotification);
      channel.unbind(EventName.NEW_LEAVE_REQUEST_EVENT, handleNewNotification);
      channel.unbind(EventName.CANCEL_LEAVE_REQUEST_EVENT, handleNewNotification);
      // channel.unbind_global(handleAllEvents);
    };
  }, [channel, mutate]);

  const [optimisticNotifications, addOptimisticNotification] = useOptimistic<
    NotificationModel[],
    { action: "read" | "delete"; id: string }
  >(notifications, (state, { action, id }) => {
    switch (action) {
      case "read":
        return state.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      case "delete":
        return state.filter((n) => n.id !== id);
      default:
        return state;
    }
  });

  const handleMarkAsRead = async (id: string) => {
    try {
      startTransition(() => {
        addOptimisticNotification({ action: "read", id });
      });

      const result = await markAsRead(id);
      if (!result.success) {
        toast.error(result.message);
      }
      await mutate();
    } catch (error) {
      console.log("🚀 ~ handleMarkAsRead ~ error:", error);
      toast.error("Failed to mark notification as read");
      await mutate();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      startTransition(() => {
        addOptimisticNotification({ action: "delete", id });
      });

      const result = await deleteNotification(id);
      if (!result.success) {
        toast.error(result.message);
      }
      await mutate();
    } catch (error) {
      console.log("🚀 ~ handleDelete ~ error:", error);
      toast.error("Failed to delete notification");
      await mutate();
    }
  };

  const unreadCount = optimisticNotifications.filter((n) => !n.isRead).length;
  const handleMutate = async () => {
    await mutate(); // Properly handle the async operation
  };
  return (
    <NotificationContext.Provider
      value={{
        notifications: optimisticNotifications,
        unreadCount,
        isLoading: isPending,
        error,
        markAsRead: handleMarkAsRead,
        deleteNotification: handleDelete,
        mutate: handleMutate,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
