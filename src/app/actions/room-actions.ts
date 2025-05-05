/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/lucia";
import { handleServerError, ServerActionError } from "@/lib/utils";
import { CreateRoomFormData, UpdateRoomFormData, createRoomSchema, updateRoomSchema } from "@/lib/schemas/room";
import { db } from "@/lib/db";
import { Room } from "@/generated/prisma";
import { read, utils } from "xlsx";

// Tạo phòng họp mới
export async function createRoom(data: CreateRoomFormData): Promise<{ success: true; data: Room } | ServerActionError> {
  try {
    // Xác thực người dùng
    const { user } = await validateRequest();
    if (!user) return handleServerError("Không có quyền truy cập");

    // Kiểm tra quyền admin
    const hasPermission = await db.user.findFirst({
      where: { id: user.id, role: { in: ["ADMIN"] } },
    });
    if (!hasPermission) return handleServerError("Chỉ ADMIN mới có quyền tạo phòng họp mới");

    // Xác thực dữ liệu đầu vào
    const validated = createRoomSchema.parse(data);

    // Tạo phòng mới
    const room = await db.room.create({
      data: {
        ...validated,
      },
      include: {
        Facilities: true,
      },
    });

    revalidatePath("/rooms");
    return { success: true, data: room };
  } catch (error) {
    console.error("Lỗi khi tạo phòng họp:", error);
    return handleServerError(error, "Không thể tạo phòng họp");
  }
}

// Cập nhật phòng họp
export async function updateRoom(data: UpdateRoomFormData): Promise<{ success: true; data: Room } | ServerActionError> {
  try {
    console.log(data);
    // Xác thực người dùng
    const { user } = await validateRequest();
    if (!user) return handleServerError("Không có quyền truy cập");

    // Kiểm tra quyền admin hoặc manager
    const hasPermission = await db.user.findFirst({
      where: {
        id: user.id,
        role: { in: ["ADMIN", "MANAGER"] },
      },
    });
    if (!hasPermission) return handleServerError("Không có quyền thực hiện thao tác này");

    // Xác thực dữ liệu đầu vào
    const validated = updateRoomSchema.parse(data);
    console.log(validated);
    const { id, ...updateData } = validated;

    // Cập nhật phòng
    const room = await db.room.update({
      where: { id },
      data: {
        ...updateData,
      },
      include: {
        Facilities: true,
      },
    });

    revalidatePath("/rooms");
    return { success: true, data: room };
  } catch (error) {
    console.error("Lỗi khi cập nhật phòng họp:", error);
    return handleServerError(error, "Không thể cập nhật phòng họp");
  }
}

// Xóa phòng họp
export async function deleteRoom(id: string): Promise<{ success: true; message: string } | ServerActionError> {
  try {
    // Xác thực người dùng
    const { user } = await validateRequest();
    if (!user) return handleServerError("Không có quyền truy cập");

    // Kiểm tra quyền admin
    const hasPermission = await db.user.findFirst({
      where: { id: user.id, role: "ADMIN" },
    });
    if (!hasPermission) return handleServerError("Chỉ ADMIN mới có quyền xóa phòng họp");

    // Xóa phòng và các tiện nghi liên quan
    await db.room.delete({
      where: { id },
    });

    revalidatePath("/rooms");
    return { success: true, message: "Xóa phòng họp thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa phòng họp:", error);
    return handleServerError(error, "Không thể xóa phòng họp");
  }
}

// Lấy thông tin phòng họp theo ID
export async function getRoom(id: string): Promise<{ success: true; data: Room } | ServerActionError> {
  try {
    const room = await db.room.findUnique({
      where: { id },
      include: {
        Facilities: true,
      },
    });

    if (!room) {
      return handleServerError("Không tìm thấy phòng họp");
    }

    return { success: true, data: room };
  } catch (error) {
    console.error("Lỗi khi lấy thông tin phòng họp:", error);
    return handleServerError(error, "Không thể lấy thông tin phòng họp");
  }
}

// Lấy danh sách phòng họp
export async function getRooms(): Promise<{ success: true; data: Room[] } | ServerActionError> {
  try {
    const rooms = await db.room.findMany({
      include: {
        Facilities: true,
      },
      orderBy: {
        floor: "asc",
      },
    });

    return { success: true, data: rooms };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng họp:", error);
    return handleServerError(error, "Không thể lấy danh sách phòng họp");
  }
}

type ImportResult = {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; message: string }>;
};

export async function importRooms(
  formData: FormData
): Promise<{ success: true; data: ImportResult } | ServerActionError> {
  try {
    // Validate request
    const { user } = await validateRequest();
    if (!user) return handleServerError("Unauthorized");

    const file = formData.get("file") as File;
    if (!file) return handleServerError("No file provided");

    // Read file content
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = utils.sheet_to_json(worksheet) as Record<string, any>[];

    const results: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Validate required fields
        if (!row.name) {
          throw new Error("Room name is required");
        }
        if (!row.capacity || row.capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }

        // Upsert room
        await db.room.upsert({
          where: { name: row.name },
          update: {
            capacity: parseInt(row.capacity),
            floor: row.floor,
            description: row.description,
            status: row.status === "true" || row.status === true,
            minBookingTime: parseInt(row.minBookingTime) || 30,
            maxBookingTime: parseInt(row.maxBookingTime) || 480,
            maxAdvanceBooking: parseInt(row.maxAdvanceBooking) || 30,
            cancellationTime: parseInt(row.cancellationTime) || 24,
          },
          create: {
            name: row.name,
            capacity: parseInt(row.capacity),
            floor: row.floor,
            description: row.description,
            status: row.status === "true" || row.status === true,
            minBookingTime: parseInt(row.minBookingTime) || 30,
            maxBookingTime: parseInt(row.maxBookingTime) || 480,
            maxAdvanceBooking: parseInt(row.maxAdvanceBooking) || 30,
            cancellationTime: parseInt(row.cancellationTime) || 24,
          },
        });

        results.imported++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 2, // +1 for header, +1 for 0-index
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    revalidatePath("/room");
    return { success: true, data: results };
  } catch (error) {
    console.error("Error importing rooms:", error);
    return handleServerError(error, "Failed to import rooms");
  }
}
