/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/parsers/word-parser.ts - phiên bản cải tiến

import { CVData } from "../schemas/cv";

/**
 * Trích xuất thông tin CV từ văn bản thô
 * @param text Văn bản trích xuất từ file Word
 * @returns Dữ liệu CV đã được phân tích
 */
export function extractCVData(text: string): CVData {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const cvData: CVData = {
    name: "",
    email: "",
    phone: "",
    address: "",
    education: [],
    experience: [],
    skills: [],
  };

  // Các regex để nhận dạng các mẫu thông tin
  const patterns = {
    name: /^(?:name|họ\s+và\s+tên|tên)[\s:]+(.+)$/i,
    fullNameHeader: /^(?:cv|curriculum vitae)[\s-]+(.+)$/i,
    email: /^(?:email|e-mail|thư\s+điện\s+tử)[\s:]+(.+@.+\..+)$/i,
    emailInline: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/,
    phone: /^(?:phone|điện\s+thoại|tel|số\s+điện\s+thoại|sđt)[\s:]+(.+)$/i,
    phoneInline: /(?:\+84|0)[\s-]?[0-9]{2,3}[\s-]?[0-9]{3}[\s-]?[0-9]{3,4}/,
    address: /^(?:address|địa\s+chỉ)[\s:]+(.+)$/i,
    educationHeader: /^(?:education|học\s+vấn|quá\s+trình\s+học\s+tập)$/i,
    experienceHeader: /^(?:experience|work experience|kinh\s+nghiệm|kinh\s+nghiệm\s+làm\s+việc)$/i,
    skillsHeader: /^(?:skills|kỹ\s+năng)$/i,
    dateRange: /(\d{1,2}\/\d{4}|\d{4})\s*-\s*(\d{1,2}\/\d{4}|\d{4}|present|hiện\s+tại)/i,
    bulletPoint: /^[•\-*]\s*/,
  };

  let currentSection: "basic" | "education" | "experience" | "skills" = "basic";
  let tempEducation: any = {};
  let tempExperience: any = {};
  let isInCompany = false;

  // Xử lý tiêu đề CV có chứa tên
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const fullNameMatch = lines[i].match(patterns.fullNameHeader);
    if (fullNameMatch) {
      cvData.name = fullNameMatch[1].trim();
      break;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(patterns.bulletPoint, "").trim();
    if (!line) continue;

    // Xác định section hiện tại
    if (line.match(/^(?:thông\s+tin|liên\s+hệ|contact)/i)) {
      currentSection = "basic";
      continue;
    } else if (line.match(/^(?:giới\s+thiệu|profile|summary)/i)) {
      continue; // Bỏ qua phần giới thiệu
    } else if (line.match(/^(?:education|học\s+vấn|quá\s+trình\s+học\s+tập)/i)) {
      currentSection = "education";
      continue;
    } else if (line.match(/^(?:experience|work experience|kinh\s+nghiệm|kinh\s+nghiệm\s+làm\s+việc)/i)) {
      currentSection = "experience";
      continue;
    } else if (line.match(/^(?:skills|kỹ\s+năng)/i)) {
      currentSection = "skills";
      continue;
    } else if (line.match(/^(?:sở\s+thích|hobbies|interests)/i)) {
      break; // Dừng ở phần sở thích
    }

    // Xử lý dữ liệu dựa vào section hiện tại
    if (currentSection === "basic") {
      const nameMatch = line.match(patterns.name);
      const emailMatch = line.match(patterns.email) || line.match(patterns.emailInline);
      const phoneMatch = line.match(patterns.phone) || line.match(patterns.phoneInline);
      const addressMatch = line.match(patterns.address);

      if (nameMatch && !cvData.name) {
        cvData.name = nameMatch[1];
      } else if (emailMatch && !cvData.email) {
        cvData.email = emailMatch[1] || emailMatch[0];
      } else if (phoneMatch && !cvData.phone) {
        cvData.phone = phoneMatch[1] || phoneMatch[0];
      } else if (addressMatch && !cvData.address) {
        cvData.address = addressMatch[1];
      } else if (line.includes(":") && !cvData.address) {
        // Xử lý địa chỉ không có từ khóa rõ ràng
        const parts = line.split(":");
        if (parts[0].toLowerCase().includes("địa chỉ") || parts[0].toLowerCase().includes("address")) {
          cvData.address = parts[1].trim();
        }
      }
    } else if (currentSection === "education") {
      const dateRangeMatch = line.match(patterns.dateRange);

      // Nếu tìm thấy đơn vị học tập hoặc năm
      if (
        line.includes("Đại học") ||
        line.includes("Trường") ||
        line.includes("University") ||
        line.match(/^\d{4}\s*-\s*\d{4}$/) ||
        line.match(/^Chứng chỉ/)
      ) {
        // Lưu mục trước đó nếu có
        if (tempEducation.institution) {
          cvData.education?.push({ ...tempEducation });
        }

        // Tạo mục mới
        tempEducation = {
          institution: line.match(/^\d{4}/) ? "" : line,
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
        };

        // Nếu dòng chứa năm thì lưu vào startDate và endDate
        if (dateRangeMatch) {
          tempEducation.startDate = dateRangeMatch[1];
          tempEducation.endDate = dateRangeMatch[2];
        }
      }
      // Nếu dòng là chuỗi năm (2013 - 2017)
      else if (dateRangeMatch && tempEducation.institution && !tempEducation.startDate) {
        tempEducation.startDate = dateRangeMatch[1];
        tempEducation.endDate = dateRangeMatch[2];
      }
      // Nếu dòng chứa "Cử nhân", "Kỹ sư", v.v.
      else if (line.match(/^(Cử nhân|Kỹ sư|Thạc sĩ|Tiến sĩ|Bachelor|Master|PhD)/i) && tempEducation.institution) {
        if (!tempEducation.degree) {
          tempEducation.degree = line;
        } else if (!tempEducation.field) {
          tempEducation.field = line;
        }
      }
      // Nếu dòng sau Chứng chỉ là năm, gộp chúng lại
      else if (tempEducation.institution && tempEducation.institution.includes("Chứng chỉ") && line.match(/^\d{4}$/)) {
        tempEducation.startDate = line;
        tempEducation.endDate = line;
      }
    } else if (currentSection === "experience") {
      const dateRangeMatch = line.match(patterns.dateRange);

      // Nếu dòng có format của tên công ty
      if (line.match(/^(Công ty|Company)/i) || line.startsWith("TNHH") || line.startsWith("Cổ phần")) {
        // Lưu mục trước đó nếu có
        if (tempExperience.company) {
          cvData.experience?.push({ ...tempExperience });
        }

        // Reset và tạo mục mới
        tempExperience = {
          company: line,
          position: "",
          startDate: "",
          endDate: "",
          description: "",
        };
        isInCompany = true;
      }
      // Nếu dòng sau tên công ty là vị trí
      else if (
        isInCompany &&
        !tempExperience.position &&
        line.match(/(Manager|Specialist|Developer|Engineer|Leader|Director)/i)
      ) {
        tempExperience.position = line;
      }
      // Nếu dòng chứa khoảng thời gian
      else if (dateRangeMatch && tempExperience.company) {
        tempExperience.startDate = dateRangeMatch[1];
        tempExperience.endDate = dateRangeMatch[2];
      }
      // Các dòng còn lại là mô tả
      else if (tempExperience.company && line.startsWith("•")) {
        if (tempExperience.description) {
          tempExperience.description += " " + line;
        } else {
          tempExperience.description = line;
        }
      }
    } else if (currentSection === "skills") {
      // Tách các kỹ năng theo dấu phẩy hoặc dấu chấm
      const skillsList = line.split(/[,;•]/);
      skillsList.forEach((skill) => {
        const trimmedSkill = skill.trim();
        if (trimmedSkill && !cvData.skills?.includes(trimmedSkill)) {
          cvData.skills?.push(trimmedSkill);
        }
      });
    }
  }

  // Thêm mục cuối cùng nếu có
  if (tempEducation.institution) {
    cvData.education?.push(tempEducation);
  }
  if (tempExperience.company) {
    cvData.experience?.push(tempExperience);
  }

  // Dọn dẹp dữ liệu giáo dục
  cvData.education = cvData.education
    ?.filter((edu) => edu.institution || edu.degree)
    .map((edu) => {
      // Nếu institution là năm, chuyển sang startDate và endDate
      if (edu.institution.match(/^\d{4}\s*-\s*\d{4}$/)) {
        const dates = edu.institution.split("-");
        edu.startDate = dates[0].trim();
        edu.endDate = dates[1].trim();
        edu.institution = edu.degree || "";
        edu.degree = edu.field || "";
      }

      return {
        institution: edu.institution || "Không có thông tin",
        degree: edu.degree || "Không có thông tin",
        field: edu.field || "Không có thông tin",
        startDate: edu.startDate || "Không có thông tin",
        endDate: edu.endDate || "Không có thông tin",
      };
    });

  // Dọn dẹp dữ liệu kinh nghiệm
  cvData.experience = cvData.experience
    ?.filter((exp) => exp.company)
    .map((exp) => {
      return {
        company: exp.company || "Không có thông tin",
        position: exp.position || "Không có thông tin",
        startDate: exp.startDate || "Không có thông tin",
        endDate: exp.endDate || "Không có thông tin",
        description: exp.description || "Không có thông tin",
      };
    });

  return cvData;
}
