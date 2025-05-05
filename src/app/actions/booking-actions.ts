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
    } as ServerActionError;
  }

  const validatedData = validatedSchema.data;
  console.log(validatedData);

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
    } as ServerActionError;
  }

  // Tạo mảng các ngày cho sự kiện lặp lại
  const bookingDates: { startTime: Date; endTime: Date }[] = [];
  const duration =
    validatedData.endTime.getTime() - validatedData.startTime.getTime();

  // Xử lý sự kiện lặp lại chỉ khi có recurrencePattern và recurrenceEndDate
  if (
    validatedData.recurrencePattern &&
    validatedData.recurrencePattern !== "none" &&
    validatedData.recurrenceEndDate
  ) {
    const currentDate = new Date(validatedData.startTime);
    const endDate = new Date(validatedData.recurrenceEndDate);

    // Đảm bảo endDate không vượt quá giới hạn hợp lý (ví dụ: 1 năm)
    const maxEndDate = new Date(currentDate);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
    if (endDate > maxEndDate) {
      return {
        success: false,
        error: "Thời gian lặp lại không hợp lệ",
        message: "Thời gian lặp lại không được vượt quá 1 năm",
      } as ServerActionError;
    }

    while (currentDate <= endDate) {
      const startTime = new Date(currentDate);
      const endTime = new Date(startTime.getTime() + duration);
      bookingDates.push({ startTime, endTime });

      // Tính toán ngày tiếp theo dựa trên mẫu lặp lại
      switch (validatedData.recurrencePattern) {
        case "daily":
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case "weekly":
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case "monthly":
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          // Trường hợp pattern không hợp lệ, trả về lỗi
          return {
            success: false,
            error: "Mẫu lặp lại không hợp lệ",
            message: "Mẫu lặp lại phải là DAILY, WEEKLY hoặc MONTHLY",
          } as ServerActionError;
      }
    }
  } else {
    // Trường hợp không có lặp lại hoặc recurrencePattern là "none"
    bookingDates.push({
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
    });
  }

  // Kiểm tra xung đột cho tất cả các sự kiện lặp lại
  for (const date of bookingDates) {
    const conflictingBookings = await db.booking.findMany({
      where: {
        roomId: validatedData.roomId,
        status: {
          not: "CANCELLED",
        },
        OR: [
          {
            startTime: { lt: date.endTime },
            endTime: { gt: date.startTime },
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return {
        success: false,
        error: "Phòng họp đã được đặt",
        message: `Phòng họp đã được đặt vào ${date.startTime.toLocaleDateString()}`,
      } as ServerActionError;
    }
  }

  // Tạo ID cho chuỗi sự kiện lặp lại
  const recurrenceId = validatedData.recurrencePattern
    ? crypto.randomUUID()
    : null;

  // Tạo tất cả các sự kiện lặp lại
  const bookingPromises = bookingDates.map((date) =>
    db.booking.create({
      data: {
        title: validatedData.title,
        startTime: date.startTime,
        endTime: date.endTime,
        description: validatedData.description,
        createdBy: user.id,
        roomId: validatedData.roomId,
        recurrencePattern: validatedData.recurrencePattern,
        recurrenceEndDate: validatedData.recurrenceEndDate,
        recurrenceId,
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
    })
  );

  const bookings = await Promise.all(bookingPromises);

  return {
    success: true,
    data: bookings[0], // Trả về sự kiện đầu tiên trong chuỗi
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
  bookingId: string
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
