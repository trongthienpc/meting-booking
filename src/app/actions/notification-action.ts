"use server";

import { db } from "@/lib/db";
import { validateRequest } from "@/lib/lucia";
import { pusherQueue } from "@/lib/queue/pusher-queue";
import {
  createNotificationSchema,
  notificationIdSchema,
  NotificationModel,
  CreateNotificationFormData,
} from "@/lib/schemas/notification";
import { handleServerError, ServerActionError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getNotifications(
  userId: string
): Promise<{ success: true; data: NotificationModel[] } | ServerActionError> {
  try {
    const notifications = await db.notification.findMany({
      where: {
        userId: userId,
        isRead: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: notifications };
  } catch (error) {
    return handleServerError(error, "Failed to fetch notifications");
  }
}

export async function createNotification(
  data: CreateNotificationFormData
): Promise<{ success: true; data: NotificationModel } | ServerActionError> {
  try {
    const { user } = await validateRequest();
    if (!user) return { success: false, message: "Unauthorized" };

    const parsedData = createNotificationSchema.parse(data);
    console.log("🚀 ~ parsedData:", parsedData);

    const notification = await db.notification.create({
      data: {
        ...parsedData,
        isRead: false,
      },
    });

    // Push realtime notification
    await pusherQueue.addJob("notify", {
      channel: `user-${notification.userId}`,
      //   event: parsedData.title,
      event: data.event ?? "leave-request",
      data: notification,
    });

    revalidatePath("/notifications");
    return { success: true, data: notification };
  } catch (error) {
    return handleServerError(error, "Failed to create notification");
  }
}

export async function markAsRead(id: string): Promise<{ success: true; data: NotificationModel } | ServerActionError> {
  try {
    const { user } = await validateRequest();
    if (!user) return { success: false, message: "Unauthorized" };

    // Validate ID
    notificationIdSchema.parse({ id });

    const notification = await db.notification.update({
      where: { id },
      data: {
        isRead: true,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/notifications");
    return { success: true, data: notification };
  } catch (error) {
    return handleServerError(error, "Failed to mark notification as isRead");
  }
}

export async function deleteNotification(
  id: string
): Promise<{ success: true; data: NotificationModel } | ServerActionError> {
  try {
    const { user } = await validateRequest();
    if (!user) return { success: false, message: "Unauthorized" };

    // Validate ID
    notificationIdSchema.parse({ id });

    const notification = await db.notification.update({
      where: { id },
      data: {
        isRead: false,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/notifications");
    return { success: true, data: notification };
  } catch (error) {
    return handleServerError(error, "Failed to delete notification");
  }
}
