import { z } from "zod";
import { notification } from "@/generated/prisma";

export type NotificationType = "info" | "success" | "warning" | "error";

export type NotificationChannel = "inApp" | "email" | "sms" | "push";

// Base Schema for validation (used in forms)
export const notificationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.enum(["info", "success", "warning", "error"] as const),
  recipientId: z.string().min(1, "Recipient is required"),
  link: z.string().optional(),
  channel: z.enum(["inApp", "email", "sms", "push"] as const).default("inApp"),
  event: z.string().optional(),
});

// Type for form data based on the schema
export type NotificationFormData = z.infer<typeof notificationSchema>;

// Type for the full model, including ID and timestamps (useful for table data)
export type NotificationModel = notification;

// Schema for ID validation (used in update/delete)
export const notificationIdSchema = z.object({
  id: z.string().min(1, { message: "Notification ID is required" }),
});

// Schema for update combines ID and form data (all fields optional for partial updates)
export const updateNotificationSchema = notificationIdSchema.merge(notificationSchema.partial());
export type UpdateNotificationFormData = z.infer<typeof updateNotificationSchema>;

// Schema for create requires all necessary fields from the base schema
export const createNotificationSchema = notificationSchema;
export type CreateNotificationFormData = z.infer<typeof createNotificationSchema>;
