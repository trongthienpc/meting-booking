"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "./_components/table/data-table";
import { columns } from "./_components/table/columns";
import { Calendar, LayoutDashboard } from "lucide-react";
import CalendarView from "@/components/ui/calendar-view";

import { RoomSheet } from "./_components/sheet/room-sheet";
import { useRoom } from "@/providers/room-provider";
import { Room } from "@/generated/prisma";
import { DeleteConfirmDialog } from "./_components/form/delete-dialog";

type ViewMode = "table" | "calendar";

const Page = () => {
  const { rooms, isLoading, removeRoom } = useRoom();

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleEdit = (room: Room) => {
    setMode("edit");
    setSelectedRoom(room);
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteDialogOpen(true);
    setDeleteRoomId(id);
  };

  const submitDelete = async () => {
    if (deleteRoomId) {
      console.log("Deleting room with ID:", deleteRoomId);
      setDeleteDialogOpen(false);
      await removeRoom(deleteRoomId);
    }
  };

  return (
    <main className="flex flex-col pt-12 space-y-6 overflow-hidden w-full h-full">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            className="text-white"
            variant={viewMode === "table" ? "default" : "outline"}
            onClick={() => setViewMode("table")}
          >
            <LayoutDashboard />
          </Button>
          <Button
            className="text-white"
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode("calendar")}
          >
            <Calendar />
          </Button>
        </div>
        <div>
          {/* <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Create</Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-md"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle>Assign meting room</DialogTitle>
                <DialogDescription>
                  Anyone who has this link will be able to view this.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <EventForm
                  onSave={() => alert("Saved")}
                  defaultDate={defaultDate}
                />
              </div>
            </DialogContent>
          </Dialog> */}
          <Button className="text-white" onClick={() => setIsOpen(true)}>
            Create meeting room
          </Button>
          <RoomSheet
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            mode={mode}
            initialData={selectedRoom}
          />
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        isPending={isLoading}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={submitDelete}
        objectName=""
      />

      {viewMode === "table" ? (
        <DataTable
          data={rooms}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="w-full h-full">
          <CalendarView handleOpenSheet={setIsOpen} />
        </div>
      )}
    </main>
  );
};

export default Page;
