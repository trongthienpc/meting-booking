import NaturalLanguageInput from "@/components/NaturalLanguageInput";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-6">
        Đặt phòng họp bằng câu lệnh tự nhiên
      </h1>
      <NaturalLanguageInput />
    </main>
  );
}
