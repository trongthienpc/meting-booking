"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import EventForm from "../EventForm";

type Event = {
  id: number;
  title: string;
  date: Date;
  time: string;
};

const initialEvents: Event[] = [
  {
    id: 1,
    title: "Create React App",
    date: new Date("2024-05-12"),
    time: "10:00",
  },
  {
    id: 2,
    title: "Listen to Music",
    date: new Date("2024-05-20"),
    time: "07:00",
  },
  {
    id: 3,
    title: "Learn JavaScript",
    date: new Date("2024-05-23"),
    time: "05:00",
  },
  { id: 4, title: "Sleep", date: new Date("2024-05-24"), time: "00:00" },
  { id: 5, title: "Work out", date: new Date("2024-05-29"), time: "11:00" },
];

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState(initialEvents);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (updatedEvent: Event) => {
    if (editingEvent) {
      // Update
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? updatedEvent : e))
      );
    } else {
      // Create
      const newEvent = {
        ...updatedEvent,
        id: Date.now(), // đơn giản hóa
      };
      setEvents((prev) => [...prev, newEvent]);
    }
    setEditingEvent(null);
    setModalOpen(false);
  };

  const dailyEvents = events.filter(
    (e) => format(e.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 text-white bg-[#121212] min-h-screen">
      {/* Left: Calendar */}
      <div className="bg-[#1e1e1e] p-4 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-2">CALENDAR</h1>
        <p className="text-xl mb-4">{format(selectedDate, "MMMM, yyyy")}</p>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          className="REACT-CALENDAR p-2 rounded-lg"
          tileClassName={({ date }) =>
            events.some(
              (event) =>
                format(event.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
            )
              ? "bg-blue-500 text-white rounded-full"
              : undefined
          }
        />
      </div>

      {/* Right: Event List */}
      <div className="space-y-4">
        {dailyEvents.length === 0 ? (
          <p className="text-lg">No events for today.</p>
        ) : (
          dailyEvents.map((event) => (
            <Card key={event.id} className="bg-blue-500 text-white">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm">
                    {format(event.date, "MMMM dd, yyyy")}
                  </p>
                  <p className="text-xl font-semibold">{event.time}</p>
                  <p className="text-lg">{event.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingEvent(event);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setEvents(events.filter((e) => e.id !== event.id))
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {editingEvent && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <EventForm event={editingEvent} onSave={handleSave} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
