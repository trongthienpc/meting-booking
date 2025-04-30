"use server";

import { revalidatePath } from "next/cache";
import { validateRequest } from "@/lib/lucia";
import { handleServerError, ServerActionError } from "@/lib/utils";
import { CreateRoomFormData,  UpdateRoomFormData, createRoomSchema, updateRoomSchema } from "@/lib/schemas/room";
import { db } from "@/lib/db";
import { Room } from "@/generated/prisma";

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
