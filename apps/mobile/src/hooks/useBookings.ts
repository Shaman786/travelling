/**
 * useBookings Hook
 *
 * React hook for managing user bookings.
 * Syncs between Appwrite and local Zustand cache.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { DATABASE_ID, TABLES } from "../lib/appwrite";
import { bookingService } from "../lib/databaseService";
import { useStore } from "../store/useStore";
import type { Booking, BookingStatus } from "../types";

interface UseBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateStatus: (
    bookingId: string,
    status: BookingStatus,
    note?: string
  ) => Promise<boolean>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<boolean>;
}

interface UseBookingReturn {
  booking: Booking | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage user's bookings
 */
export function useBookings(): UseBookingsReturn {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useStore((state) => state.user);
  const bookedTrips = useStore((state) => state.bookedTrips);
  const setBookedTrips = useStore((state) => state.setBookedTrips);
  const updateBookedTrip = useStore((state) => state.updateBookedTrip);

  // Convert BookedTrips to Booking format for return
  const bookings = useMemo<Booking[]>(() => {
    return bookedTrips.map((trip) => ({
      $id: trip.id,
      $collectionId: TABLES.BOOKINGS,
      $databaseId: DATABASE_ID,
      $permissions: [],
      $sequence: 0,
      $createdAt: trip.bookingDate.toISOString(),
      $updatedAt: trip.bookingDate.toISOString(),
      userId: user?.$id || "",
      packageId: trip.packageId,
      packageTitle: trip.packageTitle,
      destination: trip.destination,
      departureDate: trip.departureDate.toISOString(),
      returnDate: trip.returnDate.toISOString(),
      travelers: trip.travelers,
      adultsCount: trip.travelers.filter((t) => t.type === "adult").length,
      childrenCount: trip.travelers.filter((t) => t.type === "child").length,
      infantsCount: trip.travelers.filter((t) => t.type === "infant").length,
      totalPrice: trip.totalPrice,
      status: trip.status as BookingStatus,
      statusHistory: trip.statusHistory.map((h) => ({
        status: h.status as BookingStatus,
        date: h.date.toISOString(),
        note: h.note,
      })),
      paymentStatus: "paid" as const,
      createdAt: trip.bookingDate.toISOString(),
      updatedAt: trip.bookingDate.toISOString(),
    }));
  }, [bookedTrips, user?.$id]);

  const fetchBookings = useCallback(async () => {
    if (!user?.$id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const bookingsData = await bookingService.getUserBookings(user.$id);
      setBookedTrips(bookingsData);
    } catch (err: any) {
      setError(err.message || "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id, setBookedTrips]);

  // Fetch on mount and when user changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = useCallback(
    async (
      bookingId: string,
      status: BookingStatus,
      note?: string
    ): Promise<boolean> => {
      try {
        const updated = await bookingService.updateBookingStatus(
          bookingId,
          status,
          note
        );
        updateBookedTrip(bookingId, updated);
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },
    [updateBookedTrip]
  );

  const cancelBooking = useCallback(
    async (bookingId: string, reason?: string): Promise<boolean> => {
      try {
        const updated = await bookingService.cancelBooking(bookingId, reason);
        updateBookedTrip(bookingId, updated);
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      }
    },
    [updateBookedTrip]
  );

  return {
    bookings,
    isLoading,
    error,
    refresh: fetchBookings,
    updateStatus,
    cancelBooking,
  };
}

/**
 * Hook to fetch a single booking by ID
 */
export function useBooking(bookingId: string): UseBookingReturn {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useStore((state) => state.user);

  // Check local cache first
  const cachedTrip = useStore((state) =>
    state.bookedTrips.find((b) => b.id === bookingId)
  );

  // Convert cached trip to Booking format
  const cachedBooking = useMemo<Booking | null>(() => {
    if (!cachedTrip) return null;
    return {
      $id: cachedTrip.id,
      $collectionId: TABLES.BOOKINGS,
      $databaseId: DATABASE_ID,
      $permissions: [],
      $sequence: 0,
      $createdAt: cachedTrip.bookingDate.toISOString(),
      $updatedAt: cachedTrip.bookingDate.toISOString(),
      userId: user?.$id || "",
      packageId: cachedTrip.packageId,
      packageTitle: cachedTrip.packageTitle,
      destination: cachedTrip.destination,
      departureDate: cachedTrip.departureDate.toISOString(),
      returnDate: cachedTrip.returnDate.toISOString(),
      travelers: cachedTrip.travelers,
      adultsCount: cachedTrip.travelers.filter((t) => t.type === "adult")
        .length,
      childrenCount: cachedTrip.travelers.filter((t) => t.type === "child")
        .length,
      infantsCount: cachedTrip.travelers.filter((t) => t.type === "infant")
        .length,
      totalPrice: cachedTrip.totalPrice,
      status: cachedTrip.status as BookingStatus,
      statusHistory: cachedTrip.statusHistory.map((h) => ({
        status: h.status as BookingStatus,
        date: h.date.toISOString(),
        note: h.note,
      })),
      paymentStatus: "paid" as const,
      createdAt: cachedTrip.bookingDate.toISOString(),
      updatedAt: cachedTrip.bookingDate.toISOString(),
    };
  }, [cachedTrip, user?.$id]);

  const fetchBooking = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await bookingService.getBookingById(bookingId);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || "Failed to load booking");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      // Use cache if available
      if (cachedBooking) {
        setBooking(cachedBooking);
        setIsLoading(false);
      } else {
        fetchBooking();
      }
    }
  }, [bookingId, cachedBooking, fetchBooking]);

  return {
    booking,
    isLoading,
    error,
    refresh: fetchBooking,
  };
}

export default useBookings;
