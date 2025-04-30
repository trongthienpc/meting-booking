import { z } from "zod";

// Schema cho tiện nghi phòng họp
export const roomFacilitySchema = z.object({
  id: z.string().min(1, { message: "ID tiện nghi là bắt buộc" }),
  name: z.string().min(1, { message: "Tên tiện nghi là bắt buộc" }),
  quantity: z
    .number()
    .min(1, { message: "Số lượng phải lớn hơn 0" })
    .default(1),
  description: z.string().nullable(),
  status: z.boolean(),
});

// Schema cho phòng họp
export const roomSchema = z.object({
  id: z.string().min(1, { message: "ID phòng là bắt buộc" }),
  name: z.string().min(1, { message: "Tên phòng là bắt buộc" }),
  capacity: z.number().min(1, { message: "Sức chứa phải lớn hơn 0" }),
  floor: z.string().nullable(),
  description: z.string().nullable(),
  // Facilities: z.array(roomFacilitySchema),
  status: z.boolean(),
  minBookingTime: z.number(), // 30 phút
  maxBookingTime: z.number(), // 8 giờ
  maxAdvanceBooking: z.number(), // 30 ngày
  cancelationTime: z.number(), // 24 giờ
});

// Types cho form data
export type RoomFacility = z.infer<typeof roomFacilitySchema>;
export type Room = z.infer<typeof roomSchema>;

// Schema cho tạo mới
export const createRoomSchema = roomSchema.omit({ id: true });
export type CreateRoomFormData = z.infer<typeof createRoomSchema>;

// Schema cho cập nhật
export const updateRoomSchema = roomSchema.partial().extend({
  id: z.string().min(1, { message: "ID phòng là bắt buộc" }),
});
export type UpdateRoomFormData = z.infer<typeof updateRoomSchema>;
