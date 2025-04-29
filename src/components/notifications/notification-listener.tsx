"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useChannel } from "@/providers/pusher-provider";
import { useUser } from "@/providers/user-provider";
import { NotificationModel } from "@/lib/schemas/notification";
import { useNotification } from "@/providers/notification-provider";
import { EventName } from "@/constants/channels";

export function NotificationListener() {
  const { user } = useUser();
  const { mutate } = useNotification();
  const channel = useChannel(user ? `user-${user.username}` : "");

  useEffect(() => {
    if (!channel) return;

    const handleNotification = (data: NotificationModel) => {
      toast(data.title, {
        description: data.message,
        duration: 5000,
        action: data.link
          ? {
              label: "View",
              onClick: () => (window.location.href = data.link!),
            }
          : undefined,
        richColors: true,
      });
      mutate(); // Refresh notifications list
    };

    channel.bind(EventName.UPDATE_LEAVE_REQUEST_EVENT, handleNotification);
    channel.bind(EventName.REJECT_LEAVE_REQUEST_EVENT, handleNotification);
    channel.bind(EventName.APPROVE_LEAVE_REQUEST_EVENT, handleNotification);
    channel.bind(EventName.NEW_LEAVE_REQUEST_EVENT, handleNotification);
    channel.bind(EventName.CANCEL_LEAVE_REQUEST_EVENT, handleNotification);

    return () => {
      channel.unbind(EventName.UPDATE_LEAVE_REQUEST_EVENT, handleNotification);
      channel.unbind(EventName.REJECT_LEAVE_REQUEST_EVENT, handleNotification);
      channel.unbind(EventName.APPROVE_LEAVE_REQUEST_EVENT, handleNotification);
      channel.unbind(EventName.NEW_LEAVE_REQUEST_EVENT, handleNotification);
      channel.unbind(EventName.CANCEL_LEAVE_REQUEST_EVENT, handleNotification);
    };
  }, [channel, mutate]);

  return null;
}
