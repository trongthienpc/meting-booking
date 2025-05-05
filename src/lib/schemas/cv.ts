// types/cv.ts
import { z } from "zod";

// Schema cho việc xác thực dữ liệu CV
export const cvSchema = z.object({
  name: z.string().min(1, { message: "Tên là bắt buộc" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  phone: z.string().optional(),
  address: z.string().optional(),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        field: z.string(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string(),
        position: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  skills: z.array(z.string()).optional(),
});

// Kiểu dữ liệu cho CV
export type CVData = z.infer<typeof cvSchema>;
