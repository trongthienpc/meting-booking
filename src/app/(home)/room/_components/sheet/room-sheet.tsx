/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { RoomProvider, useRoom } from "@/providers/room-provider";
import { CreateRoomForm } from "../form/create-room-form";
import { Room } from "";
import { UpdateRoomForm } from "../form/update-room-form";

interface RoomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Room | null;
  mode: "create" | "edit";
}

export function RoomSheet({
  isOpen,
  onOpenChange,
  initialData,
  mode,
}: RoomSheetProps) {
  const { createNewRoom, updateExistingRoom } = useRoom();
  const handleSubmit = (data: any) => {
    if (mode === "edit" && initialData?.id) {
      updateExistingRoom(data);
    } else {
      createNewRoom(data);
    }

    onOpenChange(false);
  };

  const title = mode === "create" ? "Tạo phòng mới" : "Chỉnh sửa phòng";

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="max-h-[90vh] overflow-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <RoomProvider>
          {mode === "create" ? (
            <CreateRoomForm onSubmit={handleSubmit} initialData={initialData} />
          ) : (
            <UpdateRoomForm onSubmit={handleSubmit} initialData={initialData} />
          )}
        </RoomProvider>
      </SheetContent>
    </Sheet>
  );
}
