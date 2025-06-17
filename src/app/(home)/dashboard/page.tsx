import NaturalLanguageInput from "@/components/NaturalLanguageInput";
import CalendarView from "@/components/ui/calendar-view";
import React from "react";

const DashboardPage = () => {
  return (
    <div>
      <CalendarView />
      <NaturalLanguageInput />
    </div>
  );
};

export default DashboardPage;
