"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { CreateRoomFormData, createRoomSchema } from "@/lib/schemas/room";

interface RoomFormProps {
  onSubmit: (data: CreateRoomFormData) => void;
  initialData?: Partial<CreateRoomFormData>;
}

export function RoomForm({ onSubmit, initialData }: RoomFormProps) {
  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: initialData || {
      name: "",
      capacity: 0,
      floor: "",
      description: "",
      // Facilities: [] as RoomFacility[],
      status: true,
      minBookingTime: 30,
      maxBookingTime: 480,
      maxAdvanceBooking: 30,
      cancelationTime: 24,
    },
  });

  const handleSubmit = async (data: CreateRoomFormData) => {
    try {
      onSubmit(data);
    } catch (error) {
      console.error("Lỗi khi lưu phòng họp:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 w-full max-w-2xl mx-auto p-6"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên Phòng</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên phòng" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sức Chứa</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Nhập số người tối đa"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tầng</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập số tầng"
                      {...field}
                      value={field.value as string}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô Tả</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập mô tả phòng họp"
                    {...field}
                    value={field.value as string}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minBookingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời Gian Đặt Tối Thiểu (phút)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxBookingTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời Gian Đặt Tối Đa (phút)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="maxAdvanceBooking"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số Ngày Đặt Trước Tối Đa</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cancelationTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời Gian Hủy Trước (giờ)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Trạng Thái</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Phòng họp có sẵn sàng để sử dụng
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Hủy
          </Button>
          <Button type="submit">Lưu</Button>
        </div>
      </form>
    </Form>
  );
}
