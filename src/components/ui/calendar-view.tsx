"use client";

import { useState } from "react";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {  Pencil, Trash2 } from "lucide-react";



import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from "./calendar";


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

interface CalendarViewProps {
  handleOpensheet: (isOpen: boolean) => void;
  handleDate: (date: Date) => void;
}

export default function CalendarView({handleOpensheet, handleDate}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [events, setEvents] = useState(initialEvents);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);


  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    if(date > new Date()) {
      handleDate(date);
    } else {
      handleDate(new Date());
    }
    handleOpensheet(true);
    setEditingEvent(null); // Reset event khi tạo mới
  };

  const handleSave = (updatedEvent: Event) => {
    if (updatedEvent.id) {
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    } else {
      setEvents(prev => [...prev, { ...updatedEvent, id: Date.now() }]);
    }
    handleOpensheet(false);
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
        <Card className="p-4">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-2xl">Lịch</CardTitle>
            <CardDescription>{format(selectedDate, 'MMMM, yyyy')}</CardDescription>
          </CardHeader>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && handleDayClick(date)}
            className="rounded-md"
          />
        </Card>
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
                      handleOpensheet(true);
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
     
    </div>
  );
}


