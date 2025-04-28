"use server";

import { callGemini } from "@/lib/gemini";
import { ParsedBooking } from "@/types/parsedBooking";

export async function parseBookingRequest(
  input: string
): Promise<ParsedBooking> {
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
  console.log("🚀 ~ geminiResponse:", geminiResponse);

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
      .trim();

    const parsed: ParsedBooking = JSON.parse(sanitizedJson);

    // Validate parsed data
    if (!parsed.roomName || typeof parsed.roomName !== "string") {
      throw new Error("Tên phòng không hợp lệ");
    }

    if (!parsed.startTime || isNaN(Date.parse(parsed.startTime))) {
      throw new Error("Thời gian bắt đầu không hợp lệ");
    }

    if (typeof parsed.durationHours !== "number" || parsed.durationHours <= 0) {
      throw new Error("Thời lượng không hợp lệ");
    }

    return parsed;
  } catch (error) {
    console.error("Parse error:", error);
    throw error instanceof Error ? error : new Error("Lỗi khi xử lý dữ liệu");
  }
}
