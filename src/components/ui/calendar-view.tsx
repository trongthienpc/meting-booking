"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
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
import { FuturisticEventCard } from "./futuristic-event-card";

export default function CalendarView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const searchParam = searchParams.get("search")
    ? decodeURIComponent(searchParams.get("search")!)
    : null;

  const [selectedDate, setSelectedDate] = useState<Date>(
    dateParam ? new Date(dateParam) : new Date()
  );
  const [value, setValue] = useState(searchParam ?? "");
  const [editingEvent, setEditingEvent] = useState<Booking | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { bookings, createBooking, cancelBooking } = useBooking();

  // Cập nhật URL khi state thay đổi
  const updateURL = (date: Date, searchValue?: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("date", format(date, "yyyy-MM-dd"));
    if (searchValue?.trim()) {
      params.set("search", encodeURIComponent(searchValue));
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null);
    updateURL(date, searchParam || "");
  };

  // Xử lý thay đổi giá trị tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    const searchValue = normalizeVietnamese(e.target.value);
    updateURL(selectedDate, searchValue);
  };

  // Đồng bộ state với URL khi URL thay đổi
  useEffect(() => {
    if (dateParam) {
      setSelectedDate(new Date(dateParam));
    }
  }, [dateParam]);

  const handleSave = (data: BookingData) => {
    createBooking(data).then((success) => {
      if (success) {
        setOpenCreateDialog(false);
      }
    });
  };

  const handleDelete = (bookingId: string) => {
    cancelBooking(bookingId);
    setDeleteDialogOpen(false);
  };

  // Hàm chuẩn hóa chuỗi tiếng Việt
  const normalizeVietnamese = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/đ/g, "d");
  };

  // Filter bookings by both date and search value
  const dailyBookings = bookings.filter((e) => {
    const isActive = e.status !== "CANCELLED";
    const matchesDate =
      format(e.startTime, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

    if (!searchParam?.trim()) return matchesDate && isActive;

    const normalizedSearch = normalizeVietnamese(searchParam);
    const normalizedTitle = normalizeVietnamese(e.title);
    const normalizedCreator = normalizeVietnamese(e.Creator.fullname);
    const normalizedRoom = normalizeVietnamese(e.Room.name);
    const normalizedDepartment = e.Creator.Department?.name
      ? normalizeVietnamese(e.Creator.Department.name)
      : "";

    const matchesSearch =
      normalizedTitle.includes(normalizedSearch) ||
      normalizedCreator.includes(normalizedSearch) ||
      normalizedRoom.includes(normalizedSearch) ||
      normalizedDepartment.includes(normalizedSearch);

    return matchesDate && matchesSearch && isActive;
  });

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
                        format(date, "yyyy-MM-dd") &&
                      event.status !== "CANCELLED"
                  ),
              }}
              modifiersClassNames={{
                hasEvent:
                  "after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-blue-500 after:rounded-full text-blue-600 after:animate-pulse",
              }}
            />
          </CardContent>
        </Card>
        <div className="w-full mt-3">
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
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
      <div className="p-4 h-full flex flex-col min-h-0 max-h-[calc(100vh-8rem)]">
        <div className="flex-none">
          <h1 className="text-3xl font-bold mb-2">SỰ KIỆN TRONG NGÀY</h1>
          {/* <p className="text-xl mb-4">{format(selectedDate, "dd/MM/yyyy")}</p> */}
          <div className="flex items-center gap-2 mb-4">
            <input
              value={value}
              onChange={handleSearchChange}
              type="text"
              placeholder="Search events..."
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button variant={"outline"}>{dailyBookings.length}</Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          {dailyBookings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Không có sự kiện nào cho ngày này
              </CardContent>
            </Card>
          ) : (
            dailyBookings.map((event) => (
              <FuturisticEventCard
                key={event.id}
                event={event}
                onEdit={() => {
                  setEditingEvent(event);
                  setOpenEditDialog(true);
                }}
                onDelete={() => {
                  setEditingEvent(event);
                  setDeleteDialogOpen(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      {editingEvent && (
        <EventDialog
          mode="edit"
          open={openEditDialog}
          onOpenChange={setOpenEditDialog}
          initialData={editingEvent}
        />
      )}

      {deleteDialogOpen && (
        <DeleteConfirmDialog
          isOpen={deleteDialogOpen}
          isPending={false}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={() => handleDelete(editingEvent!.id)}
          objectName=""
        />
      )}
    </div>
  );
}
