"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(3, "Tiêu đề cần ít nhất 3 ký tự"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
  duration: z.number({ message: "Vui lòng chọn thời lượng" }),
});

type Event = {
  id: number;
  title: string;
  date: Date;
  startTime: string;
  duration: number;
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
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title || "",
      date: format(event?.date ?? defaultDate ?? new Date(), "yyyy-MM-dd"),
      startTime: event?.startTime || "09:00",
      duration: event?.duration || 60,
    },
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSave({
      id: event?.id ?? Date.now(),
      title: values.title,
      date: new Date(`${values.date}T${values.startTime}`),
      startTime: values.startTime,
      duration: values.duration,
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
              <FormControl>
                <Input placeholder="Tiêu đề" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời lượng</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời lượng" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="30">30 phút</SelectItem>
                  <SelectItem value="45">45 phút</SelectItem>
                  <SelectItem value="60">60 phút</SelectItem>
                  <SelectItem value="90">90 phút</SelectItem>
                  <SelectItem value="120">120 phút</SelectItem>
                  <SelectItem value="150">150 phút</SelectItem>
                  <SelectItem value="180">180 phút</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Lưu</Button>
      </form>
    </Form>
  );
}
