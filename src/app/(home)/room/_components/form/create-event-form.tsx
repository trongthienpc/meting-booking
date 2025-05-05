"use client";

import { useCallback, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { BookingBaseSchema, BookingData } from "@/lib/schemas/booking";
import { useRoom } from "@/providers/room-provider";

export default function CreateEventForm({
  onSave,
  defaultDate,
}: {
  defaultDate?: Date;
  onSave: (event: BookingData) => void;
}) {
  const form = useForm<BookingData>({
    resolver: zodResolver(BookingBaseSchema),
    defaultValues: {
      title: "",
      startTime:
        defaultDate && new Date(defaultDate) > new Date()
          ? defaultDate
          : new Date(),
      endTime: defaultDate ?? new Date(),
      duration: 30,
      description: "",
      roomId: "",
      recurrencePattern: "none",
      recurrenceEndDate: null,
      recurrenceId: null,
    },
    mode: "onChange",
  });

  const { isValid, isSubmitting, isDirty } = form.formState;

  const { rooms } = useRoom();

  const recurrencePattern = useWatch({
    control: form.control,
    name: "recurrencePattern",
    defaultValue: "none", // Đảm bảo có giá trị mặc định
  });

  // 2. Tạo hàm đánh giá điều kiện
  const shouldShowEndDate =
    recurrencePattern &&
    recurrencePattern !== "none" &&
    recurrencePattern !== "";

  // Tự động tính thời gian kết thúc dựa trên thời gian bắt đầu và thời lượng
  const updateEndTime = useCallback(
    (startTime: Date, duration: number) => {
      const endTime = addMinutes(startTime, duration);
      form.setValue("endTime", endTime);
    },
    [form]
  );

  // Theo dõi thay đổi của startTime và duration để cập nhật endTime
  useEffect(() => {
    const startTime = form.getValues("startTime");
    const duration = form.getValues("duration");
    if (startTime && duration) {
      updateEndTime(startTime, duration);
    }
  }, [form, updateEndTime]);

  const handleSubmit = async (values: BookingData) => {
    try {
      onSave(values);
    } catch (error) {
      console.error("Lỗi khi lưu phòng họp:", error);
      return;
    }
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
        <div className="flex flex-col sm:flex-row gap-3 ">
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem className="w-full sm:w-2/3">
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
              <FormItem className="w-full flex-1">
                <FormLabel>Thời lượng</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const startTime = form.getValues("startTime");
                    if (startTime) {
                      updateEndTime(startTime, Number(value));
                    }
                    field.onChange(Number(value));
                  }}
                  value={field.value?.toString()}
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
                    const duration = form.getValues("duration");
                    updateEndTime(date, Number(duration));
                    field.onChange(date);
                  }}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
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

        {shouldShowEndDate && (
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
            disabled={!isValid || isSubmitting || !isDirty}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
