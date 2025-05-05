import ImportRoom from "@/components/ImportRoom";
import React from "react";
import WordExtraction from "./_components/word-extraction";

const page = () => {
  return (
    <div className="flex flex-col h-full">
      <ImportRoom />
      <WordExtraction />
    </div>
  );
};

export default page;
