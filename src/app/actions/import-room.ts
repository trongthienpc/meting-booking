/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { handleServerError, ServerActionError } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { parse } from "csv-parse/sync";
import * as xlsx from "xlsx";
import { validateRequest } from "@/lib/lucia";
import { db } from "@/lib/db";

export async function importRooms(file: File): Promise<
  | {
      success: true;
      imported: number;
      failed: number;
      errors: Array<{ row: number; message: string }>;
    }
  | ServerActionError
> {
  try {
    // Validate request
    const { user } = await validateRequest();
    if (!user) return handleServerError("Unauthorized");

    // Check file type
    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileType || "")) {
      return handleServerError("Invalid file type");
    }

    // Read file contents
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    let records: any[] = [];
    const errors: Array<{ row: number; message: string }> = [];
    let imported = 0;

    // Parse based on file type
    if (fileType === "csv") {
      records = parse(Buffer.from(data), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else {
      const workbook = xlsx.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      records = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }

    // Process each record
    for (const [index, record] of records.entries()) {
      try {
        // Validate required fields
        if (!record.name) {
          throw new Error("Room name is required");
        }
        if (!record.capacity || isNaN(record.capacity) || record.capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }

        // Upsert room data
        await db.room.upsert({
          where: { name: record.name },
          update: {
            capacity: parseInt(record.capacity),
            floor: record.floor || null,
            description: record.description || null,
            status: record.status === "true" || record.status === true,
            minBookingTime: parseInt(record.minBookingTime) || 30,
            maxBookingTime: parseInt(record.maxBookingTime) || 480,
            maxAdvanceBooking: parseInt(record.maxAdvanceBooking) || 30,
            cancellationTime: parseInt(record.cancellationTime) || 24,
          },
          create: {
            name: record.name,
            capacity: parseInt(record.capacity),
            floor: record.floor || null,
            description: record.description || null,
            status: record.status === "true" || record.status === true,
            minBookingTime: parseInt(record.minBookingTime) || 30,
            maxBookingTime: parseInt(record.maxBookingTime) || 480,
            maxAdvanceBooking: parseInt(record.maxAdvanceBooking) || 30,
            cancellationTime: parseInt(record.cancellationTime) || 24,
          },
        });

        imported++;
      } catch (error) {
        errors.push({
          row: index + 2, // +1 for header, +1 for 0-based index
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    revalidatePath("/rooms");
    return {
      success: true,
      imported,
      failed: errors.length,
      errors,
    };
  } catch (error) {
    console.error("Error importing rooms:", error);
    return handleServerError(error, "Failed to import rooms");
  }
}
