"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "./calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import EventForm from "../../app/(home)/room/_components/form/create-event-form";
import EventDialog from "../../app/(home)/room/_components/sheet/event-dialog";
import { DeleteConfirmDialog } from "@/app/(home)/room/_components/form/delete-dialog";
import { useBooking } from "@/providers/booking-provider";
import { Booking } from "@/generated/prisma";
import { BookingData } from "@/lib/schemas/booking";

interface CalendarViewProps {
  handleOpenSheet: (isOpen: boolean) => void;
}

export default function CalendarView({ handleOpenSheet }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEvent, setEditingEvent] = useState<Booking | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const { bookings, createBooking } = useBooking();

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);

    setEditingEvent(null);
  };

  const handleSave = (data: BookingData) => {
    createBooking(data);
    handleOpenSheet(false);
  };

  const dailyBookings = bookings.filter(
    (e) =>
      format(e.startTime, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded shadow p-4 h-full min-h-0">
      {/* Left: Calendar */}
      <div className="p-4 rounded-xl h-full flex flex-col min-h-0">
        <h1 className="text-3xl font-bold mb-2">CALENDAR</h1>
        <p className="text-xl mb-4">{format(selectedDate, "MMMM, yyyy")}</p>
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader>
            <CardTitle className="text-2xl"></CardTitle>
            <CardDescription>
              {/* {format(selectedDate, "MMMM, yyyy")} */}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && handleDayClick(date)}
              className="rounded-md w-full"
              modifiers={{
                hasEvent: (date) =>
                  bookings.some(
                    (event) =>
                      format(event.startTime, "yyyy-MM-dd") ===
                      format(date, "yyyy-MM-dd")
                  ),
              }}
              modifiersClassNames={{
                hasEvent:
                  "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-blue-500 after:rounded-full text-blue-600",
              }}
            />
          </CardContent>
        </Card>
        <div className="w-full mt-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full text-white">
                <CalendarIcon className="w-6 h-6 text-white" />
                Đăng ký phòng họp
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-md"
              onCloseAutoFocus={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
              onInteractOutside={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="">Đăng ký phòng họp</DialogTitle>
                <DialogDescription>
                  Vui lòng điền vào các thông tin bên dưới
                </DialogDescription>
                <div className="mt-2 sm:mt-4 lg:mt-6">
                  <EventForm onSave={handleSave} defaultDate={selectedDate} />
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Right: Event List */}
      <div className="p-4 overflow-y-auto h-full flex flex-col min-h-0 max-h-[calc(100vh-8rem)]">
        <h1 className="text-3xl font-bold mb-2">SỰ KIỆN TRONG NGÀY</h1>
        <p className="text-xl mb-4">{format(selectedDate, "dd/MM/yyyy")}</p>

        <div className="space-y-4">
          {dailyBookings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Không có sự kiện nào cho ngày này
              </CardContent>
            </Card>
          ) : (
            dailyBookings.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="bg-blue-500 p-4 flex flex-col items-center justify-center text-white">
                      <span className="text-xl font-bold">
                        {format(event.startTime, "HH:mm") ?? "00:00"}
                      </span>
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(event.startTime, "EEEE, dd MMMM yyyy")}
                      </p>
                    </div>
                    <div className="p-2 flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingEvent(event);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          // setEvents(events.filter((e) => e.id !== event.id))
                          setDeleteDialogOpen(true)
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {editingEvent && (
        <EventDialog mode="edit" open={open} onOpenChange={setOpen} />
      )}

      {deleteDialogOpen && (
        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          isPending={false}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={() => alert("delete")}
          objectName=""
        />
      )}
    </div>
  );
}
