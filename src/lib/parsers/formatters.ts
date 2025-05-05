// lib/parsers/formatters.ts

import { CVData } from "../schemas/cv";

/**
 * Định dạng dữ liệu CV thành văn bản có định dạng
 * @param cvData Dữ liệu CV đã được phân tích
 * @returns Văn bản có định dạng
 */
export function formatCVData(cvData: CVData): string {
  let formatted = `Tên: ${cvData.name || "Không có thông tin"}\n`;
  formatted += `Email: ${cvData.email || "Không có thông tin"}\n`;
  formatted += `Điện thoại: ${cvData.phone || "Không có thông tin"}\n`;
  formatted += `Địa chỉ: ${cvData.address || "Không có thông tin"}\n\n`;

  if (cvData.education && cvData.education.length > 0) {
    formatted += `HỌC VẤN\n`;
    formatted += `==============================\n`;
    cvData.education.forEach((edu, index) => {
      formatted += `${index + 1}. ${edu.institution}\n`;
      formatted += `   Bằng cấp: ${edu.degree}\n`;
      formatted += `   Chuyên ngành: ${edu.field}\n`;
      formatted += `   Thời gian: ${edu.startDate} - ${edu.endDate}\n\n`;
    });
  }

  if (cvData.experience && cvData.experience.length > 0) {
    formatted += `KINH NGHIỆM LÀM VIỆC\n`;
    formatted += `==============================\n`;
    cvData.experience.forEach((exp, index) => {
      formatted += `${index + 1}. ${exp.company}\n`;
      formatted += `   Vị trí: ${exp.position}\n`;
      formatted += `   Thời gian: ${exp.startDate} - ${exp.endDate}\n`;
      formatted += `   Mô tả: ${exp.description}\n\n`;
    });
  }

  if (cvData.skills && cvData.skills.length > 0) {
    formatted += `KỸ NĂNG\n`;
    formatted += `==============================\n`;
    formatted += cvData.skills.join(", ");
  }

  return formatted;
}
