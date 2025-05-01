"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import CreateEventForm from "../form/create-event-form";
import EditEventForm from "../form/edit-event-form";
import { BookingUpdateData } from "@/lib/schemas/booking";
import { useBooking } from "@/providers/booking-provider";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData: BookingUpdateData;
}

const EventDialog = ({ open, onOpenChange, mode, initialData }: Props) => {
  const { updateBooking } = useBooking();
  const handleUpdateSubmit = async (data: BookingUpdateData) => {
    await updateBooking(data.id, data);
    onOpenChange(false);
  };
  const title =
    mode === "create"
      ? "Đăng ký phòng họp"
      : "Cập nhật thông tin đặt phòng họp";
  const description =
    mode === "create"
      ? "Vui lòng điền vào các thông tin bên dưới"
      : "Thay đổi thông tin đặt phòng họp";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        {mode === "create" ? (
          <CreateEventForm onSave={() => alert("saved")} />
        ) : (
          <EditEventForm
            initialData={initialData}
            onSave={handleUpdateSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
