/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useOptimistic,
  useTransition,
  useState,
} from "react";
import useSWR from "swr";
import { BookingData } from "@/lib/schemas/booking";
import {
  approveBooking as approveBookingAction,
  cancelBooking as cancelBookingAction,
  createBooking as createBookingAction,
  getAllBookings as getAllBookingsAction,
  getRoomBookings as getRoomBookingsAction,
  getUserBookings as getUserBookingsAction,
  updateBooking as updateBookingAction,
} from "@/app/actions/booking-actions";
import { Booking } from "@/generated/prisma";
import { toast } from "sonner";

type BookingContextType = {
  // Data
  bookings: (Booking & {
    Room: { id: string; name: string };
    Creator: {
      id: string;
      fullname: string;
      Department: {
        name: string;
      } | null;
    };
  })[];

  // Main loading and error states
  isLoading: boolean;
  error: Error | null;

  // Actions
  createBooking: (data: BookingData) => Promise<void>;
  approveBooking: (bookingId: string, userId: string) => Promise<void>;
  cancelBooking: (bookingId: string, userId: string) => Promise<void>;
  updateBooking: (
    bookingId: string,
    data: Partial<BookingData>
  ) => Promise<void>;
  getUserBookings: (userId: string) => Promise<void>;
  getRoomBookings: (roomId: string, userId?: string) => Promise<void>;
  getAllBookings: () => Promise<void>;
  getBookingDetails: (bookingId: string) => Promise<Booking | null>;

  // Mutation
  mutateBookings: () => void;

  // Action-specific loading states
  isCreating: boolean;
  isApproving: boolean;
  isCanceling: boolean;
  isUpdating: boolean;
  isFetchingUserBookings: boolean;
  isFetchingRoomBookings: boolean;
  isFetchingAllBookings: boolean;
  isFetchingDetails: boolean;

  // Action-specific error states
  createError: Error | null;
  approveError: Error | null;
  cancelError: Error | null;
  updateError: Error | null;
  userBookingsError: Error | null;
  roomBookingsError: Error | null;
  allBookingsError: Error | null;
  detailsError: Error | null;
};

export const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

const BOOKINGS_KEY = "/api/bookings";

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();

  // Action-specific loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFetchingUserBookings, setIsFetchingUserBookings] = useState(false);
  const [isFetchingRoomBookings, setIsFetchingRoomBookings] = useState(false);
  const [isFetchingAllBookings, setIsFetchingAllBookings] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);

  // Action-specific error states
  const [createError, setCreateError] = useState<Error | null>(null);
  const [approveError, setApproveError] = useState<Error | null>(null);
  const [cancelError, setCancelError] = useState<Error | null>(null);
  const [updateError, setUpdateError] = useState<Error | null>(null);
  const [userBookingsError, setUserBookingsError] = useState<Error | null>(
    null
  );
  const [roomBookingsError, setRoomBookingsError] = useState<Error | null>(
    null
  );
  const [allBookingsError, setAllBookingsError] = useState<Error | null>(null);
  const [detailsError, setDetailsError] = useState<Error | null>(null);

  // Fetch bookings using SWR
  const {
    data: bookings = [],
    error,
    isLoading,
    mutate: mutateBookings,
  } = useSWR<
    (Booking & {
      Room: { id: string; name: string };
      Creator: {
        id: string;
        fullname: string;
        Department: {
          name: string;
        } | null;
      };
    })[]
  >(
    BOOKINGS_KEY,
    async () => {
      const res = await getAllBookingsAction();
      if (!res.success) return [];
      return res.data;
    },
    {
      revalidateOnFocus: false,
    }
  );

  // Optimistic updates
  const [optimisticBookings, addOptimisticBooking] = useOptimistic<
    (Booking & {
      Room: { id: string; name: string };
      Creator: {
        id: string;
        fullname: string;
        Department: {
          name: string;
        } | null;
      };
    })[],
    { action: "create" | "update" | "cancel" | "approve"; data: any }
  >(bookings, (state, { action, data }) => {
    switch (action) {
      case "create":
        return [
          ...state,
          {
            ...data,
            id: "temp-" + Date.now(),
            Room: data.room,
            Creator: data.creator,
          },
        ];
      case "update":
        return state.map((booking) =>
          booking.id === data.id ? { ...booking, ...data } : booking
        );
      case "cancel":
        return state.map((booking) =>
          booking.id === data ? { ...booking, status: "CANCELLED" } : booking
        );
      case "approve":
        return state.map((booking) =>
          booking.id === data ? { ...booking, status: "CONFIRMED" } : booking
        );
      default:
        return state;
    }
  });

  // Create booking with optimistic update
  const handleCreateBooking = async (data: BookingData) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      startTransition(async () => {
        addOptimisticBooking({ action: "create", data });
        const result = await createBookingAction(data);
        if (!result.success) {
          toast.error(result.message || "Không thể tạo lịch họp");
          setCreateError(new Error(result.message || "Không thể tạo lịch họp"));
          return;
        }
        await mutateBookings();
        toast.success("Tạo lịch họp thành công");
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Không thể tạo lịch họp");
      setCreateError(error);
      toast.error(error.message);
      await mutateBookings(); // Revert optimistic update
    } finally {
      setIsCreating(false);
    }
  };

  // Approve booking with optimistic update
  const handleApproveBooking = async (bookingId: string, userId: string) => {
    setIsApproving(true);
    setApproveError(null);
    try {
      startTransition(async () => {
        addOptimisticBooking({ action: "approve", data: bookingId });
        const result = await approveBookingAction(bookingId, userId);
        if (!result.success) {
          toast.error(result.message || "Không thể phê duyệt lịch họp");
          setApproveError(
            new Error(result.message || "Không thể phê duyệt lịch họp")
          );
          return;
        }
        await mutateBookings();
        toast.success("Phê duyệt lịch họp thành công");
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Không thể phê duyệt lịch họp");
      setApproveError(error);
      toast.error(error.message);
      await mutateBookings(); // Revert optimistic update
    } finally {
      setIsApproving(false);
    }
  };

  // Cancel booking with optimistic update
  const handleCancelBooking = async (bookingId: string, userId: string) => {
    setIsCanceling(true);
    setCancelError(null);
    try {
      startTransition(async () => {
        addOptimisticBooking({ action: "cancel", data: bookingId });
        const result = await cancelBookingAction(bookingId, userId);
        if (!result.success) {
          toast.error(result.message || "Không thể hủy lịch họp");
          setCancelError(new Error(result.message || "Không thể hủy lịch họp"));
          return;
        }
        await mutateBookings();
        toast.success("Hủy lịch họp thành công");
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Không thể hủy lịch họp");
      setCancelError(error);
      toast.error(error.message);
      await mutateBookings(); // Revert optimistic update
    } finally {
      setIsCanceling(false);
    }
  };

  // Update booking with optimistic update
  const handleUpdateBooking = async (
    bookingId: string,
    data: Partial<BookingData>
  ) => {
    setIsUpdating(true);
    setUpdateError(null);
    try {
      startTransition(async () => {
        addOptimisticBooking({
          action: "update",
          data: { id: bookingId, ...data },
        });
        const result = await updateBookingAction(
          bookingId,
          data as BookingData
        );
        if (!result.success) {
          toast.error(result.message || "Không thể cập nhật lịch họp");
          setUpdateError(
            new Error(result.message || "Không thể cập nhật lịch họp")
          );
          return;
        }
        await mutateBookings();
        toast.success("Cập nhật lịch họp thành công");
      });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Không thể cập nhật lịch họp");
      setUpdateError(error);
      toast.error(error.message);
      await mutateBookings(); // Revert optimistic update
    } finally {
      setIsUpdating(false);
    }
  };

  // Get user bookings
  const handleGetUserBookings = async (userId: string) => {
    setIsFetchingUserBookings(true);
    setUserBookingsError(null);
    try {
      const result = await getUserBookingsAction(userId);
      if (!result.success) {
        setUserBookingsError(
          new Error(result.message || "Không thể lấy danh sách lịch họp")
        );
        return;
      }
      await mutateBookings();
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Không thể lấy danh sách lịch họp");
      setUserBookingsError(error);
    } finally {
      setIsFetchingUserBookings(false);
    }
  };

  // Get room bookings
  const handleGetRoomBookings = async (roomId: string, userId?: string) => {
    setIsFetchingRoomBookings(true);
    setRoomBookingsError(null);
    try {
      const result = await getRoomBookingsAction(roomId, userId);
      if (!result.success) {
        setRoomBookingsError(
          new Error(
            result.message || "Không thể lấy danh sách lịch họp của phòng"
          )
        );
        return;
      }
      await mutateBookings();
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Không thể lấy danh sách lịch họp của phòng");
      setRoomBookingsError(error);
    } finally {
      setIsFetchingRoomBookings(false);
    }
  };

  // Get all bookings
  const handleGetAllBookings = async () => {
    setIsFetchingAllBookings(true);
    setAllBookingsError(null);
    try {
      await mutateBookings();
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Không thể lấy tất cả lịch họp");
      setAllBookingsError(error);
    } finally {
      setIsFetchingAllBookings(false);
    }
  };

  // Get booking details
  const handleGetBookingDetails = async (
    bookingId: string
  ): Promise<Booking | null> => {
    setIsFetchingDetails(true);
    setDetailsError(null);
    try {
      // Tìm booking trong danh sách hiện có
      const booking = optimisticBookings.find((b) => b.id === bookingId);
      if (booking) {
        setIsFetchingDetails(false);
        return booking;
      }

      // Nếu không tìm thấy, có thể cần fetch lại từ server
      await mutateBookings();
      const updatedBooking = optimisticBookings.find((b) => b.id === bookingId);
      return updatedBooking || null;
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Không thể lấy chi tiết lịch họp");
      setDetailsError(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const value = {
    bookings: optimisticBookings,
    isLoading: isLoading || isPending,
    error,
    createBooking: handleCreateBooking,
    approveBooking: handleApproveBooking,
    cancelBooking: handleCancelBooking,
    updateBooking: handleUpdateBooking,
    getUserBookings: handleGetUserBookings,
    getRoomBookings: handleGetRoomBookings,
    getAllBookings: handleGetAllBookings,
    getBookingDetails: handleGetBookingDetails,
    mutateBookings,
    isCreating,
    isApproving,
    isCanceling,
    isUpdating,
    isFetchingUserBookings,
    isFetchingRoomBookings,
    isFetchingAllBookings,
    isFetchingDetails,
    createError,
    approveError,
    cancelError,
    updateError,
    userBookingsError,
    roomBookingsError,
    allBookingsError,
    detailsError,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
