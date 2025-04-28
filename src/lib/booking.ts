import { ROOMS } from "@/constants/rooms";
import { Booking } from "@/types/booking";

// Giả sử danh sách booking hiện tại trong memory:
export const BOOKINGS: Booking[] = [
  {
    roomName: "phòng A",
    startTime: new Date("2025-04-29T09:00:00"),
    endTime: new Date("2025-04-29T11:00:00"),
  },
  {
    roomName: "phòng B",
    startTime: new Date("2025-05-05T13:00:00"),
    endTime: new Date("2025-05-05T15:00:00"),
  },
];

// Hàm chuẩn hóa tên phòng
function normalizeRoomName(name: string): string {
  // Đảm bảo kiểu dữ liệu cho roomMapping
  const roomMapping: Record<string, string> = {
    "phòng họp 1": "phòng 1",
    "phòng 1 lầu 1": "phòng 1",
    "phòng họp 1 nhỏ": "phòng 1",
    "phòng họp A": "phòng A",
    "phòng họp 2": "phòng 2",
    "phòng họp lớn": "phòng 2",
    "phòng 1": "phòng 1",
    "phòng 2": "phòng 2",
    "phòng A": "phòng A",
    A: "phòng A",
  };

  const lowercasedName = name.toLowerCase().trim();

  // Tìm kiếm trong roomMapping
  const normalized = Object.keys(roomMapping).find((key) =>
    lowercasedName.includes(key.toLowerCase())
  );

  return normalized ? roomMapping[normalized] : lowercasedName;
}

// Hàm kiểm tra xem phòng có trống không
export function isRoomAvailable(
  roomName: string,
  startTime: Date,
  durationHours: number
): boolean {
  const normalizedRoomName = normalizeRoomName(roomName); // Chuẩn hóa tên phòng

  // Tính thời gian kết thúc cuộc họp mới
  const endTime = new Date(
    startTime.getTime() + durationHours * 60 * 60 * 1000
  );

  // Kiểm tra nếu có cuộc họp nào đã đặt phòng trong khoảng thời gian này
  for (const booking of BOOKINGS) {
    if (booking.roomName === normalizedRoomName) {
      // Kiểm tra nếu thời gian đặt trùng với khoảng thời gian cuộc họp
      if (
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime)
      ) {
        return false; // Nếu phòng đã có cuộc họp trong thời gian này, phòng không trống
      }
    }
  }

  return true; // Nếu không có cuộc họp trùng, phòng trống
}
export function suggestAvailableRooms(
  startTime: Date,
  durationHours: number
): string[] {
  return ROOMS.filter((room) =>
    isRoomAvailable(room, startTime, durationHours)
  );
}
