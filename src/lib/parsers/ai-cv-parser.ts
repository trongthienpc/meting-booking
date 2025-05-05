// lib/parsers/ai-cv-parser.ts
import { callGemini } from "@/lib/gemini";
import { CVData, cvSchema } from "../schemas/cv";

/**
 * Sử dụng Gemini API để trích xuất thông tin CV từ văn bản
 * @param text Văn bản trích xuất từ file Word
 * @returns Dữ liệu CV đã được phân tích
 */
export async function extractCVDataWithAI(text: string): Promise<CVData> {
  // Tạo prompt cho Gemini
  const prompt = `
Phân tích CV sau đây và trả về thông tin dưới dạng JSON với các trường:
- name: Tên người làm CV
- email: Email liên hệ
- phone: Số điện thoại
- address: Địa chỉ
- education: Mảng các đối tượng giáo dục, mỗi đối tượng gồm:
  - institution: Tên trường/tổ chức
  - degree: Bằng cấp/chứng chỉ
  - field: Lĩnh vực học tập
  - startDate: Ngày bắt đầu
  - endDate: Ngày kết thúc
- experience: Mảng các đối tượng kinh nghiệm làm việc, mỗi đối tượng gồm:
  - company: Tên công ty
  - position: Vị trí làm việc
  - startDate: Ngày bắt đầu
  - endDate: Ngày kết thúc
  - description: Mô tả công việc
- skills: Mảng các kỹ năng

Chỉ trả về đối tượng JSON, không bao gồm giải thích hay văn bản khác.

CV để phân tích:
${text}
`;

  try {
    // Gọi Gemini API
    const response = await callGemini(prompt);

    if (response.error) {
      throw new Error(`Gemini API error: ${response.error}`);
    }

    // Phân tích kết quả JSON từ phản hồi
    const jsonStart = response.text.indexOf("{");
    const jsonEnd = response.text.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("Không tìm thấy dữ liệu JSON trong phản hồi");
    }

    const jsonText = response.text.substring(jsonStart, jsonEnd);
    const parsedData = JSON.parse(jsonText) as CVData;

    // Xác thực dữ liệu với schema
    const validationResult = cvSchema.safeParse(parsedData);

    if (!validationResult.success) {
      console.warn("Validation warnings:", validationResult.error.format());
      // Trả về dữ liệu mặc dù có lỗi xác thực để xử lý dữ liệu không đầy đủ
      return ensureValidCV(parsedData);
    }

    return parsedData;
  } catch (error) {
    console.error("Lỗi khi phân tích CV với AI:", error);
    // Nếu có lỗi với AI, thử dùng phương pháp regex
    return {
      name: "",
      email: "",
      phone: "",
      address: "",
      education: [],
      experience: [],
      skills: [],
    };
  }
}

/**
 * Đảm bảo dữ liệu CV đáp ứng cấu trúc cần thiết
 */
function ensureValidCV(data: Partial<CVData>): CVData {
  return {
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    education: Array.isArray(data.education)
      ? data.education.map((edu) => ({
          institution: edu.institution || "Không có thông tin",
          degree: edu.degree || "Không có thông tin",
          field: edu.field || "Không có thông tin",
          startDate: edu.startDate || "Không có thông tin",
          endDate: edu.endDate || "Không có thông tin",
        }))
      : [],
    experience: Array.isArray(data.experience)
      ? data.experience.map((exp) => ({
          company: exp.company || "Không có thông tin",
          position: exp.position || "Không có thông tin",
          startDate: exp.startDate || "Không có thông tin",
          endDate: exp.endDate || "Không có thông tin",
          description: exp.description || "Không có thông tin",
        }))
      : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
  };
}
