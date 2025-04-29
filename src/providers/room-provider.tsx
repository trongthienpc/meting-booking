/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useOptimistic, useTransition } from "react";
import { Room, CreateRoomFormData, UpdateRoomFormData } from "@/lib/schemas/room";
import useSWR from "swr";
import { toast } from "sonner";
import { createRoom, deleteRoom, updateRoom } from "@/app/actions/room-actions";

type RoomContextType = {
  rooms: Room[];
  isLoading: boolean;
  error: Error | null;
  createNewRoom: (data: CreateRoomFormData) => Promise<void>;
  updateExistingRoom: (data: UpdateRoomFormData) => Promise<void>;
  removeRoom: (id: string) => Promise<void>;
};

const RoomContext = createContext<RoomContextType | null>(null);

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();

  // Fetch rooms using SWR
  const {
    data: rooms = [],
    error,
    mutate,
  } = useSWR<Room[]>("/api/rooms", {
    revalidateOnFocus: false,
  });

  // Optimistic updates
  const [optimisticRooms, addOptimisticRoom] = useOptimistic<
    Room[],
    { action: "create" | "update" | "delete"; data: any }
  >(rooms, (state, { action, data }) => {
    switch (action) {
      case "create":
        return [...state, { ...data, id: "temp-" + Date.now() }];
      case "update":
        return state.map((room) => (room.id === data.id ? { ...room, ...data } : room));
      case "delete":
        return state.filter((room) => room.id !== data);
      default:
        return state;
    }
  });

  // Create function with optimistic update
  const createNewRoom = async (data: CreateRoomFormData) => {
    try {
      addOptimisticRoom({ action: "create", data });

      startTransition(async () => {
        const result = await createRoom(data);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        await mutate();
        toast.success("Tạo phòng họp thành công");
      });
    } catch (error) {
      console.error("Lỗi khi tạo phòng họp:", error);
      toast.error("Không thể tạo phòng họp");
      await mutate(); // Revert optimistic update
    }
  };

  // Update function with optimistic update
  const updateExistingRoom = async (data: UpdateRoomFormData) => {
    try {
      addOptimisticRoom({ action: "update", data });

      startTransition(async () => {
        const result = await updateRoom(data);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        await mutate();
        toast.success("Cập nhật phòng họp thành công");
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng họp:", error);
      toast.error("Không thể cập nhật phòng họp");
      await mutate(); // Revert optimistic update
    }
  };

  // Delete function with optimistic update
  const removeRoom = async (id: string) => {
    try {
      addOptimisticRoom({ action: "delete", data: id });

      startTransition(async () => {
        const result = await deleteRoom(id);
        if (!result.success) {
          toast.error(result.message);
          return;
        }
        await mutate();
        toast.success("Xóa phòng họp thành công");
      });
    } catch (error) {
      console.error("Lỗi khi xóa phòng họp:", error);
      toast.error("Không thể xóa phòng họp");
      await mutate(); // Revert optimistic update
    }
  };

  return (
    <RoomContext.Provider
      value={{
        rooms: optimisticRooms,
        isLoading: isPending,
        error,
        createNewRoom,
        updateExistingRoom,
        removeRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

// Custom hook to use the context
export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }
  return context;
}
