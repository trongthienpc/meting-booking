"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, format } from "date-fns";
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
import { BookingUpdateData, BookingUpdateSchema } from "@/lib/schemas/booking";
import { useRoom } from "@/providers/room-provider";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect } from "react";

export default function EditEventForm({
  initialData,
  onSave,
}: {
  initialData: BookingUpdateData;
  defaultDate?: Date;
  onSave: (event: BookingUpdateData) => void;
}) {
  const { rooms } = useRoom();

  const form = useForm({
    resolver: zodResolver(BookingUpdateSchema),
    defaultValues: {
      id: initialData?.id,
      description: initialData?.description,
      title: initialData?.title,
      roomId: initialData?.roomId,
      startTime: initialData?.startTime,
      endTime: initialData?.endTime,
      duration: initialData?.duration,
      recurrencePattern: initialData?.recurrencePattern,
      recurrenceEndDate: initialData?.recurrenceEndDate
        ? new Date(initialData.recurrenceEndDate)
        : null,
      recurrenceId: initialData?.recurrenceId,
    },
    mode: "onChange",
  });

  const { isValid, isSubmitting, errors } = form.formState;
  useEffect(() => {
    console.log("Form validation errors:", errors);
    console.log("Form validity:", isValid);
  }, [errors, isValid]);

  console.log("Form values:", form.getValues());

  // Tự động tính thời gian kết thúc dựa trên thời gian bắt đầu và thời lượng
  const updateEndTime = useCallback(
    (startTime: Date, duration: number) => {
      const endTime = addMinutes(startTime, duration);
      form.setValue("endTime", endTime);
    },
    [form]
  );

  const handleSubmit = async (values: BookingUpdateData) => {
    console.log(values);
    onSave(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full max-h-[70vh] max-w-2xl mx-auto p-6 overflow-y-auto "
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề cuộc họp</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tiêu đề cuộc họp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem className="w-1/2">
                <FormLabel>Phòng họp</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng họp" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rooms &&
                      rooms.length > 0 &&
                      rooms.map((room) => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
                  onValueChange={(value) => {
                    const startTime = form.getValues("startTime");
                    if (startTime) {
                      updateEndTime(startTime, parseInt(value));
                    }
                    field.onChange(parseInt(value));
                  }}
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
        </div>

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời gian bắt đầu</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={format(field.value, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    field.onChange(date);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Nhập mô tả cuộc họp"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recurrencePattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lặp lại</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn kiểu lặp lại" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Không lặp lại</SelectItem>
                  <SelectItem value="daily">Hàng ngày</SelectItem>
                  <SelectItem value="weekly">Hàng tuần</SelectItem>
                  <SelectItem value="monthly">Hàng tháng</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("recurrencePattern") && (
          <FormField
            control={form.control}
            name="recurrenceEndDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày kết thúc lặp lại</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value
                        ? new Date(e.target.value)
                        : null;
                      field.onChange(date);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            className="w-32"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
