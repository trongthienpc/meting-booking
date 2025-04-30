"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRoom } from "@/providers/room-provider";
import { Room, CreateRoomFormData, createRoomSchema } from "@/lib/schemas/room";
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

import { Switch } from "../ui/switch";

type RoomFormProps = {
  room?: Room | null;
  onSuccess: () => void;
};

export function RoomForm({ room, onSuccess }: RoomFormProps) {
  const { createNewRoom, updateExistingRoom } = useRoom();

  const form = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: room || {
      name: "",
      capacity: 0,
      floor: "",
      // facilities: [],
      description: "",
      status: true,
      minBookingTime: 30,
      maxBookingTime: 480,
      maxAdvanceBooking: 30,
      cancelationTime: 24,
    },
  });

  const onSubmit = async (data: CreateRoomFormData) => {
    try {
      if (room) {
        await updateExistingRoom({ ...data, id: room.id });
      } else {
        await createNewRoom(data);
      }
      onSuccess();
      form.reset();
    } catch (error) {
      console.error("Lỗi khi lưu phòng họp:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                  type="input"
                  placeholder="Nhập số tầng"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => onSuccess()}>
            Hủy
          </Button>
          <Button type="submit">{room ? "Cập Nhật" : "Tạo Mới"}</Button>
        </div>
      </form>
    </Form>
  );
}
