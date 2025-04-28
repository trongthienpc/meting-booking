import { GoogleGenAI } from "@google/genai";
import NodeCache from "node-cache";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({ apiKey });
const cache = new NodeCache({ stdTTL: 3600 }); // Cache trong 1 giờ

export interface GeminiResponse {
  text: string;
  error?: string;
}

export async function callGemini(prompt: string): Promise<GeminiResponse> {
  // Kiểm tra cache trước
  const cachedResponse = cache.get<string>(prompt);
  if (cachedResponse) {
    return { text: cachedResponse };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", // Model nhẹ hơn để tăng tốc độ
      contents: prompt,
    });

    const responseText = response.text as string;
    cache.set(prompt, responseText); // Lưu vào cache

    return { text: responseText };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      text: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
