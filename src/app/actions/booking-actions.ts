"use server";
import { Booking } from "@/generated/prisma";
import { db } from "@/lib/db";
import { validateRequest } from "@/lib/lucia";
import {
  BookingBaseSchema,
  BookingData,
  BookingTimeValidationSchema,
} from "@/lib/schemas/booking";
import { handleServerError, ServerActionError } from "@/lib/utils";

export async function createBooking(data: BookingData): Promise<
  | {
      success: true;
      data: Booking & {
        Room: { id: string; name: string };
        Creator: {
          id: string;
          fullname: string;
          Department: {
            name: string;
          } | null;
        };
      };
    }
  | ServerActionError
> {
  // Validate input data

  const { user } = await validateRequest();

  if (!user) return handleServerError("Không có quyền truy cập");

  const validatedSchema = BookingBaseSchema.safeParse(data);

  if (!validatedSchema.success) {
    return {
      success: false,
      error: "Dữ liệu không hợp lệ",
      message: validatedSchema.error.issues[0].message,
    } as ServerActionError; // Type cas
  }

  const validatedData = validatedSchema.data;

  //   // Check if user has permission to create booking
  //   const canCreate = await checkUserRole(userId, [
  //     UserRole.USER,
  //     UserRole.MANAGER,
  //   ]);
  //   if (!canCreate) {
  //     throw new Error("Bạn không có quyền tạo booking");
  //   }

  // Validate booking time
  const timeValidation = BookingTimeValidationSchema.safeParse({
    startTime: validatedData.startTime,
    endTime: validatedData.endTime,
    roomId: validatedData.roomId,
  });

  if (!timeValidation.success) {
    return {
      success: false,
      error: "Dữ liệu không hợp lệ",
      message: timeValidation.error.issues[0].message,
    } as ServerActionError; // Type cast cho lỗi không hợp lệ
  }

  // Check room availability
  const conflictingBookings = await db.booking.findMany({
    where: {
      roomId: validatedData.roomId,
      OR: [
        {
          startTime: { lt: validatedData.endTime },
          endTime: { gt: validatedData.startTime },
        },
      ],
    },
  });

  if (conflictingBookings.length > 0) {
    return {
      success: false,
      error: "Phòng họp đã được đặt",
      message: "Phòng họp đã được đặt trong thời gian này",
    } as ServerActionError; // Type cas
  }

  // Create booking
  const booking = await db.booking.create({
    data: {
      title: validatedData.title,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      description: validatedData.description,
      createdBy: user.id,
      roomId: validatedData.roomId,
    },
    include: {
      Room: {
        select: {
          id: true,
          name: true,
        },
      },
      Creator: {
        select: {
          id: true,
          fullname: true,
          Department: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    success: true,
    data: booking,
  };
}

export async function getRoomBookings(
  roomId: string,
  userId?: string
): Promise<{ success: true; data: Booking[] } | ServerActionError> {
  try {
    const { user } = await validateRequest();

    if (!user) return handleServerError("Không có quyền truy cập");

    const whereClause = userId
      ? {
          roomId,
          OR: [
            { createdBy: userId },
            { BookingAttendee: { some: { userId } } },
          ],
        }
      : { roomId };

    const roomBookings = await db.booking.findMany({
      where: whereClause,
      orderBy: { startTime: "asc" },
      include: {
        Room: true,
        Creator: true,
      },
    });

    return {
      success: true,
      data: roomBookings,
    };
  } catch (error) {
    return handleServerError(error, "Không thể lấy danh sách booking");
  }
}

// Manager only functions
export async function getAllBookings(): Promise<
  | {
      success: true;
      data: (Booking & {
        Room: { id: string; name: string };
        Creator: {
          id: string;
          fullname: string;
          Department: {
            name: string;
          } | null;
        };
      })[];
    }
  | ServerActionError
> {
  const { user } = await validateRequest();

  if (!user) return handleServerError("Không có quyền truy cập");

  const data = await db.booking.findMany({
    orderBy: { startTime: "asc" },
    include: {
      Room: {
        select: {
          id: true,
          name: true,
        },
      },
      Creator: {
        select: {
          id: true,
          fullname: true,
          Department: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    success: true,
    data,
  };
}

export async function approveBooking(
  bookingId: string,
  managerId: string
): Promise<{ success: true; data: Booking } | ServerActionError> {
  try {
    const { user } = await validateRequest();

    if (!user) return handleServerError("Không có quyền truy cập");

    const role = user.role;

    if (role !== "MANAGER") {
      return handleServerError("Bạn không có quyền phê duyệt booking");
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        Room: true,
        Creator: true,
      },
    });

    if (!booking) {
      return handleServerError("Booking không tồn tại");
    }

    if (booking.status !== "PENDING") {
      return handleServerError("Booking không thể phê duyệt"); // Thêm thông báo lỗi tùy chọ
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        approvedBy: managerId,
      },
      include: {
        Room: true,
        Creator: true,
      },
    });

    return {
      success: true,
      data: updatedBooking,
    };
  } catch (error) {
    return handleServerError(error, "Không thể phê duyệt booking");
  }
}

export async function getUserBookings(
  userId: string
): Promise<{ success: true; data: Booking[] } | ServerActionError> {
  try {
    const { user } = await validateRequest();

    if (!user) return handleServerError("Không có quyền truy cập");

    const bookings = await db.booking.findMany({
      where: {
        OR: [{ createdBy: userId }, { BookingAttendee: { some: { userId } } }],
      },
    });
    return {
      success: true,
      data: bookings,
    };
  } catch (error) {
    return handleServerError(error, "Không thể lấy danh sách booking");
  }
}

export async function cancelBooking(
  bookingId: string,
  userId: string
): Promise<{ success: true; data: Booking } | ServerActionError> {
  try {
    const { user } = await validateRequest();

    if (!user) return handleServerError("Không có quyền truy cập");

    const isExistingBooking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!isExistingBooking) {
      return handleServerError("Booking không tồn tại");
    }

    if (isExistingBooking.createdBy !== userId) {
      return handleServerError("Bạn không có quyền hủy booking");
    }

    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
      },
      include: {
        Room: true,
        Creator: true,
      },
    });

    return {
      success: true,
      data: updatedBooking,
    };
  } catch (error) {
    return await handleServerError(error, "Không thể hủy booking");
  }
}

export async function updateBooking(
  bookingId: string,
  data: BookingData
): Promise<{ success: true; data: Booking } | ServerActionError> {
  try {
    const { user } = await validateRequest();

    if (!user) return handleServerError("Không có quyền truy cập");

    const isExistingBooking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!isExistingBooking) {
      return handleServerError("Booking không tồn tại");
    }

    if (isExistingBooking.createdBy !== user.id) {
      return handleServerError("Bạn không có quyền cập nhật booking");
    }

    const updatedBooking = await db.booking.update({
      data: data,
      where: { id: bookingId },
    });

    return {
      success: true,
      data: updatedBooking,
    };
  } catch (error) {
    return handleServerError(error, "Không thể cập nhật booking");
  }
}
