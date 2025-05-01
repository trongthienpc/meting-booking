import { z } from "zod";

// Schema cho thông tin cơ bản của booking
export const BookingBaseSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  startTime: z.date(),
  endTime: z.date(),
  description: z.string().nullable(),
  roomId: z.string().min(1, "Phải chọn phòng"),
  attendees: z.array(z.string()).min(1, "Phải có ít nhất 1 người tham dự"),
  createdBy: z.string().min(1, "Người tạo là bắt buộc"),
  approvedBy: z.string().nullable(),
  recurrencePattern: z.string().nullable(),
  recurrenceEndDate: z.date().nullable(),
  recurrenceId: z.string().nullable(),
});

// Schema cho validation thời gian đặt phòng
export const BookingTimeValidationSchema = z
  .object({
    startTime: z.date(),
    endTime: z.date(),
    roomId: z.string(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu",
    path: ["endTime"],
  });

// Type cho dữ liệu booking
export type BookingData = z.infer<typeof BookingBaseSchema>;
export type BookingTimeValidationData = z.infer<
  typeof BookingTimeValidationSchema
>;
