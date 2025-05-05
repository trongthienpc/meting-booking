// app/api/parse-word/route.ts
import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractCVData } from "@/lib/parsers/word-parser";
import { formatCVData } from "@/lib/parsers/formatters";
import { cvSchema } from "@/lib/schemas/cv";
import { extractCVDataWithAI } from "@/lib/parsers/ai-cv-parser";

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json({ error: "Không có file được tải lên" }, { status: 400 });
//     }

//     const fileType = file.name.split(".").pop()?.toLowerCase();
//     if (!["docx", "doc"].includes(fileType || "")) {
//       return NextResponse.json(
//         { error: "Định dạng file không hợp lệ. Vui lòng tải lên file Word (.docx hoặc .doc)" },
//         { status: 400 }
//       );
//     }

//     const fileBuffer = Buffer.from(await file.arrayBuffer());

//     // Trích xuất văn bản từ file Word
//     const result = await mammoth.extractRawText({ buffer: fileBuffer });
//     const text = result.value;

//     // Phân tích dữ liệu CV
//     const cvData = extractCVData(text);

//     // Xác thực dữ liệu với schema
//     const validationResult = cvSchema.safeParse(cvData);

//     if (!validationResult.success) {
//       return NextResponse.json(
//         {
//           error: "Không thể trích xuất đủ thông tin cần thiết từ CV",
//           validationErrors: validationResult.error.format(),
//         },
//         { status: 422 }
//       );
//     }

//     // Format dữ liệu để hiển thị
//     const formattedText = formatCVData(cvData);

//     return NextResponse.json({
//       ...cvData,
//       formattedText,
//     });
//   } catch (error) {
//     console.error("Lỗi khi phân tích file Word:", error);
//     return NextResponse.json({ error: "Không thể phân tích file Word" }, { status: 500 });
//   }
// }

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const useAI = formData.get("useAI") === "true";

    if (!file) {
      return NextResponse.json({ error: "Không có file được tải lên" }, { status: 400 });
    }

    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (!["docx", "doc"].includes(fileType || "")) {
      return NextResponse.json(
        { error: "Định dạng file không hợp lệ. Vui lòng tải lên file Word (.docx hoặc .doc)" },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Trích xuất văn bản từ file Word
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const text = result.value;

    // Phân tích dữ liệu CV với phương pháp được chọn
    let cvData;
    let method = "regex";

    if (useAI) {
      try {
        cvData = await extractCVDataWithAI(text);
        method = "ai";
      } catch (error) {
        console.warn("AI parsing failed, falling back to regex:", error);
        cvData = extractCVData(text);
      }
    } else {
      cvData = extractCVData(text);
    }

    // Xác thực dữ liệu với schema
    const validationResult = cvSchema.safeParse(cvData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Không thể trích xuất đủ thông tin cần thiết từ CV",
          validationErrors: validationResult.error.format(),
          partialData: cvData,
        },
        { status: 422 }
      );
    }

    // Format dữ liệu để hiển thị
    const formattedText = formatCVData(cvData);

    return NextResponse.json({
      ...cvData,
      formattedText,
      method,
    });
  } catch (error) {
    console.error("Lỗi khi phân tích file Word:", error);
    return NextResponse.json({ error: "Không thể phân tích file Word" }, { status: 500 });
  }
}
