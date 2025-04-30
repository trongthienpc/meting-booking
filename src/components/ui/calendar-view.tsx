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
import EventForm from "../EventForm";

type Event = {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  duration: number;
};

const initialEvents: Event[] = [
  {
    id: 1,
    title: "Team Meeting",
    date: new Date("2025-05-01"),
    startTime: "09:00",
    duration: 60,
  },
  {
    id: 2,
    title: "Client Call",
    date: new Date("2025-05-05"),
    startTime: "14:30",
    duration: 60,
  },
  {
    id: 3,
    title: "Project Deadline",
    date: new Date("2025-05-15"),
    startTime: "17:00",
    duration: 60,
  },
  {
    id: 4,
    title: "Workshop",
    date: new Date("2025-05-25"),
    startTime: "10:00",
    duration: 60,
  },
  {
    id: 5,
    title: "Review Session",
    date: new Date("2025-05-30"),
    startTime: "13:00",
    duration: 60,
  },
  {
    id: 6,
    title: "Create React App",
    date: new Date("2025-05-12"),
    startTime: "10:00",
    duration: 60,
  },
  {
    id: 7,
    title: "Listen to Music",
    date: new Date("2025-05-20"),
    startTime: "07:00",
    duration: 60,
  },
  {
    id: 8,
    title: "Learn JavaScript",
    date: new Date("2025-05-23"),
    startTime: "05:00",
    duration: 60,
  },
  {
    id: 9,
    title: "Sleep",
    date: new Date("2025-04-24"),
    startTime: "00:00",
    duration: 60,
  },

  {
    id: 10,
    title: "Work out",
    date: new Date("2025-04-29"),
    startTime: "11:00",
    duration: 60,
  },
];

interface CalendarViewProps {
  handleOpenSheet: (isOpen: boolean) => void;
}

export default function CalendarView({ handleOpenSheet }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState(initialEvents);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);

    setEditingEvent(null);
  };

  const handleSave = (updatedEvent: Event) => {
    if (updatedEvent.id) {
      setEvents((prev) =>
        prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
      );
    } else {
      setEvents((prev) => [...prev, { ...updatedEvent, id: Date.now() }]);
    }
    handleOpenSheet(false);
  };

  const dailyEvents = events.filter(
    (e) => format(e.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 rounded shadow p-4 min-h-screen">
      {/* Left: Calendar */}
      <div className="p-4 rounded-xl">
        <h1 className="text-3xl font-bold mb-2">CALENDAR</h1>
        <p className="text-xl mb-4">{format(selectedDate, "MMMM, yyyy")}</p>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Lịch</CardTitle>
            <CardDescription>
              {format(selectedDate, "MMMM, yyyy")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && handleDayClick(date)}
              className="rounded-md"
              modifiers={{
                hasEvent: (date) =>
                  events.some(
                    (event) =>
                      format(event.date, "yyyy-MM-dd") ===
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
              <Button className="w-full">
                <CalendarIcon className="w-6 h-6" />
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
                <DialogTitle>Đăng ký phòng họp</DialogTitle>
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
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">
          Sự kiện ngày {format(selectedDate, "dd/MM/yyyy")}
        </h2>

        <div className="space-y-4">
          {dailyEvents.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Không có sự kiện nào cho ngày này
              </CardContent>
            </Card>
          ) : (
            dailyEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="bg-blue-500 p-4 flex flex-col items-center justify-center text-white">
                      <span className="text-xl font-bold">
                        {event.startTime ?? "00:00"}
                      </span>
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(event.date, "EEEE, dd MMMM yyyy")}
                      </p>
                    </div>
                    <div className="p-2 flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditingEvent(event);
                          handleOpenSheet(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700"
                        onClick={() =>
                          setEvents(events.filter((e) => e.id !== event.id))
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
    </div>
  );
}
