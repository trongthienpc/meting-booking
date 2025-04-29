"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

type Event = {
  id: number;
  title: string;
  date: Date;
  time: string;
};

export default function EventForm({
  event,
  onSave,
  defaultDate,
}: {
  event?: Event | null;
  defaultDate?: Date;
  onSave: (event: Event) => void;
}) {
  const [title, setTitle] = useState(event?.title || "");
  const [date, setDate] = useState(
    format(event?.date ?? defaultDate ?? new Date(), "yyyy-MM-dd")
  );
  const [time, setTime] = useState(event?.time || "09:00");

  const handleSubmit = () => {
    const newEvent: Event = {
      id: event?.id ?? Date.now(),
      title,
      date: new Date(`${date}T${time}`),
      time,
    };
    onSave(newEvent);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Tiêu đề</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label>Ngày</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div>
        <Label>Giờ</Label>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>
      <Button onClick={handleSubmit}>Lưu</Button>
    </div>
  );
}
