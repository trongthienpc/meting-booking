"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./_components/table/data-table";
import { columns } from "./_components/table/columns";
import { Calendar, LayoutDashboard } from "lucide-react";
import CalendarView from "@/components/ui/calendar-view";
import { Dialog,  DialogContent, DialogDescription,  DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import EventForm from "@/components/EventForm";


type ViewMode = "table" | "calendar";

const Page = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isOpen, setIsOpen] = useState(false);
  const [defaultDate, setDefaultDate] = useState<Date>(new Date());

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
        <div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Create</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign meting room</DialogTitle>
                <DialogDescription>
                  Anyone who has this link will be able to view this.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <EventForm onSave={()=> alert("Saved")} defaultDate={defaultDate}/>
              </div>
              
            </DialogContent>
          </Dialog>
        </div>
      </div>



      {viewMode === "table" ? (
        <DataTable
          data={[]}
          columns={columns}
          onEdit={() => { }}
          onDelete={() => { }}
        />
      ) : (
        <div className="w-full">
          <CalendarView handleOpensheet={setIsOpen} handleDate={setDefaultDate}/>
        </div>
      )}
    </main>
  );
};

export default Page;
