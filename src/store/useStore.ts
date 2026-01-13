/**
 * Zustand Store for Travelling App
 *
 * Manages:
 * - Authentication state (user, isLoggedIn)
 * - Booking draft (wizard flow persistence)
 * - Current trip tracking
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Booking, BookingDraft, BookingStatus } from "../types";

// Types
export interface User {
  $id: string;
  id?: string; // legacy support
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  // Onboarding fields
  onboardingComplete?: boolean;
  travelStyle?: string;
  budgetRange?: string;
  preferredDestinations?: string[];
}

export interface Traveler {
  id: string;
  name: string;
  age: number;
  passportNumber?: string;
  type: "adult" | "child" | "infant";
}

export interface TripDraft {
  destinationId?: string;
  destinationName?: string;
  departureDate?: Date;
  returnDate?: Date;
  travelers: Traveler[];
  totalTravelers: number;
  adults: number;
  children: number;
  infants: number;
  specialRequests?: string;
  selectedPackageId?: string;
  currentStep: number;
}

export interface BookedTrip {
  id: string;
  packageId: string;
  packageTitle: string;
  packageImageUrl?: string; // Added field
  destination: string;
  departureDate: Date;
  returnDate: Date;
  travelers: Traveler[];
  totalPrice: number;
  status: BookingStatus;
  paymentStatus?: "pending" | "paid" | "failed" | "refunded"; // Restoring for UI feedback
  statusHistory: {
    status: string;
    date: Date;
    note?: string;
  }[];
  bookingDate: Date;
}

// Initial booking draft state
const initialBookingDraft: BookingDraft = {
  packageId: undefined,
  packageTitle: undefined,
  destination: undefined,
  packagePrice: undefined,
  departureDate: undefined,
  returnDate: undefined,
  travelers: [],
  adultsCount: 1,
  childrenCount: 0,
  infantsCount: 0,
  specialRequests: undefined,
  currentStep: 0,
};

interface AppState {
  // Auth State
  user: User | null;
  isLoggedIn: boolean;

  // Booking Draft (Wizard Flow) - Legacy
  tripDraft: TripDraft;

  // Booking Draft (New booking flow)
  bookingDraft: BookingDraft;

  // My Trips
  bookedTrips: BookedTrip[];

  // Favorites
  favoritePackages: string[];

  // Comparison
  comparisonList: string[]; // List of package IDs (max 2)

  // Actions - Auth
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Actions - Trip Draft (Legacy)
  updateTripDraft: (updates: Partial<TripDraft>) => void;
  resetTripDraft: () => void;
  setDraftStep: (step: number) => void;
  addTraveler: (traveler: Traveler) => void;
  removeTraveler: (travelerId: string) => void;
  updateTraveler: (travelerId: string, updates: Partial<Traveler>) => void;

  // Actions - Booking Draft (New)
  updateBookingDraft: (updates: Partial<BookingDraft>) => void;
  resetBookingDraft: () => void;

  // Actions - Booked Trips
  bookTrip: (
    trip: Omit<BookedTrip, "id" | "status" | "statusHistory" | "bookingDate">
  ) => void;
  setBookedTrips: (trips: Booking[]) => void;
  addBookedTrip: (trip: BookedTrip | Booking) => void;
  updateBookedTrip: (tripId: string, updates: Partial<Booking>) => void;
  updateTripStatus: (
    tripId: string,
    status: BookedTrip["status"],
    note?: string
  ) => void;
  removeBookedTrip: (tripId: string) => void;

  // Actions - Favorites
  addFavorite: (packageId: string) => void;
  removeFavorite: (packageId: string) => void;
  toggleFavorite: (packageId: string) => void;

  // Actions - Comparison
  addToComparison: (packageId: string) => void;
  removeFromComparison: (packageId: string) => void;
  clearComparison: () => void;
}

// Initial trip draft state
const initialTripDraft: TripDraft = {
  destinationId: undefined,
  destinationName: undefined,
  departureDate: undefined,
  returnDate: undefined,
  travelers: [],
  totalTravelers: 1,
  adults: 1,
  children: 0,
  infants: 0,
  specialRequests: undefined,
  selectedPackageId: undefined,
  currentStep: 0,
};

// Create the store
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isLoggedIn: false,
      tripDraft: initialTripDraft,
      bookingDraft: initialBookingDraft,
      bookedTrips: [],
      favoritePackages: [],
      comparisonList: [],

      // Auth Actions
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      login: (user) => set({ user, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Trip Draft Actions
      updateTripDraft: (updates) =>
        set((state) => ({
          tripDraft: { ...state.tripDraft, ...updates },
        })),

      resetTripDraft: () => set({ tripDraft: initialTripDraft }),

      // Booking Draft Actions (New)
      updateBookingDraft: (updates) =>
        set((state) => ({
          bookingDraft: { ...state.bookingDraft, ...updates },
        })),

      resetBookingDraft: () => set({ bookingDraft: initialBookingDraft }),

      setDraftStep: (step) =>
        set((state) => ({
          tripDraft: { ...state.tripDraft, currentStep: step },
        })),

      addTraveler: (traveler) =>
        set((state) => ({
          tripDraft: {
            ...state.tripDraft,
            travelers: [...state.tripDraft.travelers, traveler],
          },
        })),

      removeTraveler: (travelerId) =>
        set((state) => ({
          tripDraft: {
            ...state.tripDraft,
            travelers: state.tripDraft.travelers.filter(
              (t) => t.id !== travelerId
            ),
          },
        })),

      updateTraveler: (travelerId, updates) =>
        set((state) => ({
          tripDraft: {
            ...state.tripDraft,
            travelers: state.tripDraft.travelers.map((t) =>
              t.id === travelerId ? { ...t, ...updates } : t
            ),
          },
        })),

      // Booked Trips Actions
      bookTrip: (tripData) =>
        set((state) => ({
          bookedTrips: [
            ...state.bookedTrips,
            {
              ...tripData,
              id: "booking_" + Date.now(),
              status: "processing",
              statusHistory: [
                {
                  status: "processing",
                  date: new Date(),
                  note: "Booking initiated",
                },
              ],
              bookingDate: new Date(),
            },
          ],
        })),

      addBookedTrip: (trip) =>
        set((state) => {
          // Convert Booking to BookedTrip if needed
          const bookedTrip: BookedTrip = {
            id: (trip as Booking).$id || (trip as BookedTrip).id,
            packageId: trip.packageId,
            packageTitle: trip.packageTitle,
            packageImageUrl:
              (trip as Booking).packageImageUrl ||
              (trip as BookedTrip).packageImageUrl, // Sync image
            destination: trip.destination,
            departureDate:
              typeof trip.departureDate === "string"
                ? new Date(trip.departureDate)
                : trip.departureDate,
            returnDate:
              typeof trip.returnDate === "string"
                ? new Date(trip.returnDate)
                : trip.returnDate,
            travelers: trip.travelers,
            totalPrice: trip.totalPrice,
            status: trip.status as BookingStatus,
            paymentStatus: (trip as Booking).paymentStatus, // Restore
            statusHistory: trip.statusHistory.map((h) => ({
              status: h.status,
              date: typeof h.date === "string" ? new Date(h.date) : h.date,
              note: h.note,
            })),
            bookingDate: (trip as Booking).createdAt
              ? new Date((trip as Booking).createdAt)
              : (trip as BookedTrip).bookingDate || new Date(),
          };
          return {
            bookedTrips: [...state.bookedTrips, bookedTrip],
          };
        }),

      setBookedTrips: (trips) =>
        set(() => ({
          bookedTrips: trips.map((trip) => ({
            id: trip.$id,
            packageId: trip.packageId,
            packageTitle: trip.packageTitle,
            destination: trip.destination,
            departureDate: new Date(trip.departureDate),
            returnDate: new Date(trip.returnDate),
            travelers: trip.travelers,
            totalPrice: trip.totalPrice,
            status: trip.status as BookedTrip["status"],
            paymentStatus: trip.paymentStatus, // Restore
            statusHistory: trip.statusHistory.map((h) => ({
              status: h.status,
              date: new Date(h.date),
              note: h.note,
            })),
            bookingDate: new Date(trip.createdAt),
          })),
        })),

      updateBookedTrip: (tripId, updates) =>
        set((state) => ({
          bookedTrips: state.bookedTrips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  ...(updates.status && {
                    status: updates.status as BookedTrip["status"],
                  }),
                  ...(updates.paymentStatus && {
                    paymentStatus: updates.paymentStatus as any, // Restore
                  }),
                  ...(updates.totalPrice && { totalPrice: updates.totalPrice }),
                }
              : trip
          ),
        })),

      updateTripStatus: (tripId, status, note) =>
        set((state) => ({
          bookedTrips: state.bookedTrips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  status,
                  statusHistory: [
                    ...trip.statusHistory,
                    { status, date: new Date(), note },
                  ],
                }
              : trip
          ),
        })),

      removeBookedTrip: (tripId) =>
        set((state) => ({
          bookedTrips: state.bookedTrips.filter((trip) => trip.id !== tripId),
        })),

      // Favorites Actions
      addFavorite: (packageId) =>
        set((state) => ({
          favoritePackages: state.favoritePackages.includes(packageId)
            ? state.favoritePackages
            : [...state.favoritePackages, packageId],
        })),

      removeFavorite: (packageId) =>
        set((state) => ({
          favoritePackages: state.favoritePackages.filter(
            (id) => id !== packageId
          ),
        })),

      toggleFavorite: (packageId) =>
        set((state) => ({
          favoritePackages: state.favoritePackages.includes(packageId)
            ? state.favoritePackages.filter((id) => id !== packageId)
            : [...state.favoritePackages, packageId],
        })),

      // Comparison Actions
      addToComparison: (packageId) =>
        set((state) => {
          if (state.comparisonList.includes(packageId)) return state;
          if (state.comparisonList.length >= 2) {
            // If full (2 items), replace the first one (FIFO)
            const [, second] = state.comparisonList;
            return { comparisonList: [second, packageId] };
          }
          return { comparisonList: [...state.comparisonList, packageId] };
        }),

      removeFromComparison: (packageId) =>
        set((state) => ({
          comparisonList: state.comparisonList.filter((id) => id !== packageId),
        })),

      clearComparison: () => set({ comparisonList: [] }),
    }),
    {
      name: "travelling-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        bookedTrips: state.bookedTrips,
        favoritePackages: state.favoritePackages,
      }),
    }
  )
);

// Selectors (for convenience)
export const selectUser = (state: AppState) => state.user;
export const selectIsLoggedIn = (state: AppState) => state.isLoggedIn;
export const selectTripDraft = (state: AppState) => state.tripDraft;
export const selectBookedTrips = (state: AppState) => state.bookedTrips;
export const selectFavoritePackages = (state: AppState) =>
  state.favoritePackages;
