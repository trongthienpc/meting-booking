"use server";

import { callGemini } from "@/lib/gemini";
import { ParsedBooking } from "@/types/parsedBooking";

export async function parseBookingRequest(input: string): Promise<{
  success: boolean;
  data?: {
    roomName: string;
    startTime: string;
    durationHours: number;
  };
  error?: string;
}> {
  if (!input?.trim()) {
    throw new Error("Input không được để trống");
  }

  const prompt = `
Bạn là một hệ thống AI giúp phân tích yêu cầu đặt phòng họp.
Ngày hiện tại là: ${new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  })}
Hãy trích xuất thông tin từ câu sau:
"${input}"

Trả về kết quả JSON theo đúng format:
{
  "roomName": string,
  "startTime": string (ISO 8601, giờ địa phương UTC+7),
  "durationHours": number
}

Lưu ý:
- Thời gian bắt đầu phải sau ngày hiện tại
- Nếu không đủ thông tin, hãy điền giá trị null hoặc 0.
Chỉ trả lại JSON, không giải thích thêm.
  `;

  const geminiResponse = await callGemini(prompt);

  if (geminiResponse.error) {
    throw new Error(`Lỗi khi gọi Gemini API: ${geminiResponse.error}`);
  }

  try {
    const rawText = geminiResponse.text.trim();

    // Dùng regex lấy phần nội dung JSON giữa các dấu ```
    const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const jsonString = match ? match[1] : rawText; // Nếu không match thì dùng nguyên text

    // Sanitize: chỉ loại bỏ kí tự điều khiển, giữ Unicode
    const sanitizedJson = jsonString
      .replace(/[\u0000-\u001F\u007F]/g, "")
      .trim()
      .replace(/^\s*\{/, "{") // Loại bỏ khoảng trắng đầu dòng trước {
      .replace(/\}\s*$/, "}"); // Loại bỏ khoảng trắng cuối dòng sau }

    // Parse JSON với try-catch riêng để bắt lỗi cú pháp
    let parsed: ParsedBooking;
    try {
      parsed = JSON.parse(sanitizedJson);
      console.log("🚀 ~ parseBookingRequest ~ parsed:", parsed);
    } catch (e) {
      throw new Error(`Lỗi cú pháp JSON: ${e instanceof Error ? e.message : "Unknown error"}`);
    }

    // Validate parsed data chi tiết hơn
    if (!parsed.roomName || typeof parsed.roomName !== "string" || parsed.roomName.trim().length === 0) {
      throw new Error("Tên phòng không được để trống");
    }

    if (!parsed.startTime || isNaN(Date.parse(parsed.startTime))) {
      throw new Error("Thời gian bắt đầu không hợp lệ hoặc không đúng định dạng ISO 8601");
    }

    // Kiểm tra thời gian bắt đầu phải sau thời gian hiện tại
    const currentTime = new Date();
    const startTime = new Date(parsed.startTime);
    if (startTime <= currentTime) {
      throw new Error("Thời gian bắt đầu phải sau thời gian hiện tại");
    }

    if (typeof parsed.durationHours !== "number" || parsed.durationHours <= 0 || parsed.durationHours > 24) {
      throw new Error("Thời lượng phải là số dương và không quá 24 giờ");
    }

    return {
      success: true,
      data: {
        roomName: parsed.roomName,
        startTime: parsed.startTime,
        durationHours: parsed.durationHours,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function simpleAction() {
  console.log("Simple action called");
  return { test: "This is a simple test", timestamp: new Date().toISOString() };
}
