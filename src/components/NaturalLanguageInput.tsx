"use client";

import { useState } from "react";
import { parseBookingRequest } from "@/actions/parseBooking";
import { ParsedBooking } from "@/types/parsedBooking";
import { checkAvailability } from "@/actions/checkAvailability";

export default function NaturalLanguageInput() {
  const [input, setInput] = useState("Đặt cho tôi phòng họp 1 lúc 10h ngày mai, họp khoảng 3h");
  const [result, setResult] = useState<ParsedBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean;
    suggestions: string[];
  } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setAvailability(null);
    try {
      const parsed = await parseBookingRequest(input);
      console.log("✅ Parsed result:", parsed);
      setResult(parsed);
      if (parsed) {
        const check = await checkAvailability(parsed.roomName, parsed.startTime, parsed.durationHours);

        setAvailability(check);
      }
      setLoading(false);
    } catch (error) {
      console.error("❌ Error parsing:", error);
    }
  };

  return (
    <div className="space-y-4 ">
      <textarea
        className="w-full p-3 border rounded-md"
        rows={4}
        placeholder="Nhập yêu cầu đặt phòng..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        {loading ? "Đang xử lý..." : "Phân tích yêu cầu"}
      </button>

      {result && (
        <div className="bg-gray-100 p-4 rounded space-y-2">
          <h2 className="font-semibold text-lg">Kết quả phân tích:</h2>
          <p>
            <strong>Phòng:</strong> {result.roomName}
          </p>
          <p>
            <strong>Thời gian bắt đầu:</strong> {new Date(result.startTime).toLocaleString()}
          </p>
          <p>
            <strong>Thời lượng:</strong> {result.durationHours} giờ
          </p>
        </div>
      )}

      {availability && (
        <div className="bg-yellow-100 p-4 rounded space-y-2">
          {availability.available ? (
            <p className="text-green-700 font-semibold">Phòng họp {result?.roomName} còn trống. Bạn có thể đặt!</p>
          ) : (
            <>
              <p className="text-red-700 font-semibold">Phòng họp {result?.roomName} đã có người đặt rồi.</p>
              <p>Phòng trống khác:</p>
              <ul className="list-disc pl-5">
                {availability.suggestions.map((room) => (
                  <li key={room}>{room}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
