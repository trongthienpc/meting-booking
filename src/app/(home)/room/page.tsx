import NaturalLanguageInput from "@/components/NaturalLanguageInput";
import React from "react";

const Page = () => {
  return (
    <main className="flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-6">Đặt phòng họp bằng câu lệnh tự nhiên</h1>
      <NaturalLanguageInput />
    </main>
  );
};

export default Page;
