/**
 * Zustand Store for Travelling App
 * 
 * Manages:
 * - Authentication state (user, isLoggedIn)
 * - Booking draft (wizard flow persistence)
 * - Current trip tracking
 */

import { create } from "zustand";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
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
  destination: string;
  departureDate: Date;
  returnDate: Date;
  travelers: Traveler[];
  totalPrice: number;
  status: "processing" | "documents_verified" | "visa_submitted" | "visa_approved" | "ready_to_fly" | "completed";
  statusHistory: {
    status: string;
    date: Date;
    note?: string;
  }[];
  bookingDate: Date;
}

interface AppState {
  // Auth State
  user: User | null;
  isLoggedIn: boolean;

  // Booking Draft (Wizard Flow)
  tripDraft: TripDraft;

  // My Trips
  bookedTrips: BookedTrip[];

  // Actions - Auth
  setUser: (user: User | null) => void;
  login: (user: User) => void;
  logout: () => void;

  // Actions - Trip Draft
  updateTripDraft: (updates: Partial<TripDraft>) => void;
  resetTripDraft: () => void;
  setDraftStep: (step: number) => void;
  addTraveler: (traveler: Traveler) => void;
  removeTraveler: (travelerId: string) => void;
  updateTraveler: (travelerId: string, updates: Partial<Traveler>) => void;

  // Actions - Booked Trips
  addBookedTrip: (trip: BookedTrip) => void;
  updateTripStatus: (tripId: string, status: BookedTrip["status"], note?: string) => void;
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
export const useStore = create<AppState>((set, get) => ({
  // Initial State
  user: null,
  isLoggedIn: false,
  tripDraft: initialTripDraft,
  bookedTrips: [],

  // Auth Actions
  setUser: (user) => set({ user, isLoggedIn: !!user }),

  login: (user) => set({ user, isLoggedIn: true }),

  logout: () => set({ user: null, isLoggedIn: false }),

  // Trip Draft Actions
  updateTripDraft: (updates) =>
    set((state) => ({
      tripDraft: { ...state.tripDraft, ...updates },
    })),

  resetTripDraft: () => set({ tripDraft: initialTripDraft }),

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
        travelers: state.tripDraft.travelers.filter((t) => t.id !== travelerId),
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
  addBookedTrip: (trip) =>
    set((state) => ({
      bookedTrips: [...state.bookedTrips, trip],
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
}));

// Selectors (for convenience)
export const selectUser = (state: AppState) => state.user;
export const selectIsLoggedIn = (state: AppState) => state.isLoggedIn;
export const selectTripDraft = (state: AppState) => state.tripDraft;
export const selectBookedTrips = (state: AppState) => state.bookedTrips;
