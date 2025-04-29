"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./_components/table/data-table";
import { columns } from "./_components/table/columns";
import { Calendar, LayoutDashboard } from "lucide-react";
import CalendarView from "@/components/ui/calendar-view";
import "react-calendar/dist/Calendar.css";

type ViewMode = "table" | "calendar";

const Page = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  return (
    <main className="flex flex-col pt-12 space-y-6 overflow-hidden w-full h-full">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
          >
            <LayoutDashboard />
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode("calendar")}
          >
            <Calendar />
          </Button>
        </div>
      </div>

      {viewMode === "table" ? (
        <DataTable
          data={[]}
          columns={columns}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      ) : (
        <div className="w-full">
          <CalendarView />
        </div>
      )}
    </main>
  );
};

export default Page;
