// components/leave-balance/sheets/leave-balance-sheet.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CreateRoomFormData } from "@/lib/schemas/room";
import { RoomProvider } from "@/providers/room-provider";
import { RoomForm } from "../form/room-form";

interface RoomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateRoomFormData) => void;
  initialData?: Partial<CreateRoomFormData>;
  mode: "create" | "edit";
}

export function RoomSheet({
  isOpen,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: RoomSheetProps) {
  const handleSubmit = (data: CreateRoomFormData) => {
    onSubmit(data);
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
          <RoomForm onSubmit={handleSubmit} initialData={initialData} />
        </RoomProvider>
      </SheetContent>
    </Sheet>
  );
}
