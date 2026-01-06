/**
 * useBookings Hook
 * 
 * React hook for managing user bookings.
 * Syncs between Appwrite and local Zustand cache.
 */

import { useCallback, useEffect, useState } from "react";
import { isAppwriteConfigured } from "../lib/appwrite";
import { bookingService } from "../lib/databaseService";
import { useStore } from "../store/useStore";
import type { Booking, BookingStatus } from "../types";

interface UseBookingsReturn {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateStatus: (bookingId: string, status: BookingStatus, note?: string) => Promise<boolean>;
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
  const removeBookedTrip = useStore((state) => state.removeBookedTrip);

  const fetchBookings = useCallback(async () => {
    if (!user?.$id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isAppwriteConfigured()) {
        const bookings = await bookingService.getUserBookings(user.$id);
        setBookedTrips(bookings);
      }
      // If Appwrite not configured, use cached data from store
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

  const updateStatus = useCallback(async (
    bookingId: string,
    status: BookingStatus,
    note?: string
  ): Promise<boolean> => {
    try {
      if (isAppwriteConfigured()) {
        const updated = await bookingService.updateBookingStatus(bookingId, status, note);
        updateBookedTrip(bookingId, updated);
      } else {
        // Update local state only
        updateBookedTrip(bookingId, { status });
      }
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [updateBookedTrip]);

  const cancelBooking = useCallback(async (
    bookingId: string,
    reason?: string
  ): Promise<boolean> => {
    try {
      if (isAppwriteConfigured()) {
        await bookingService.cancelBooking(bookingId, reason);
      }
      removeBookedTrip(bookingId);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [removeBookedTrip]);

  return {
    bookings: bookedTrips,
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

  // Check local cache first
  const cachedBooking = useStore((state) => 
    state.bookedTrips.find((b) => b.$id === bookingId)
  );

  const fetchBooking = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isAppwriteConfigured()) {
        const data = await bookingService.getBookingById(bookingId);
        setBooking(data);
      } else if (cachedBooking) {
        setBooking(cachedBooking);
      } else {
        setError("Booking not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load booking");
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, cachedBooking]);

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
