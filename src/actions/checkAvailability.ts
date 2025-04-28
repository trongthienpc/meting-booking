"use server";

import { isRoomAvailable, suggestAvailableRooms } from "@/lib/booking";

export async function checkAvailability(
  roomName: string,
  startTimeISO: string,
  durationHours: number
) {
  const startTime = new Date(startTimeISO);

  const available = isRoomAvailable(roomName, startTime, durationHours);

  if (available) {
    return { available: true, suggestions: [] };
  }

  const suggestions = suggestAvailableRooms(startTime, durationHours);
  return { available: false, suggestions };
}
