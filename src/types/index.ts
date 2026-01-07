/**
 * Type definitions for Travelling App
 * All entities match Appwrite collection schemas
 */

import { Models } from "react-native-appwrite";

// ============ User Types ============
export interface User {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  pushToken?: string;
}

export interface AuthUser {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  phone?: string;
  prefs: Record<string, unknown>;
}

// ============ Package Types ============
export interface PackageItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
}

export interface TravelPackage extends Models.Document {
  title: string;
  destination: string;
  country: string;
  category: "beach" | "mountain" | "city" | "adventure" | "cultural" | "luxury";
  price: number;
  duration: string; // e.g., "7 Days / 6 Nights"
  rating: number;
  reviewCount: number;
  imageUrl: string;
  images: string[];
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: PackageItineraryDay[];
  isActive: boolean;
  createdAt: string;
}

// ============ Traveler Types ============
export interface Traveler {
  id: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  type: "adult" | "child" | "infant";
}

export interface SavedTraveler extends Models.Document {
  userId: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  passportNumber?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}

// ============ Booking Types ============
export type BookingStatus = 
  | "pending_payment"
  | "processing"
  | "documents_verified"
  | "visa_submitted"
  | "visa_approved"
  | "ready_to_fly"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface StatusHistoryEntry {
  status: BookingStatus;
  date: string;
  note?: string;
}

export interface Booking extends Models.Document {
  userId: string;
  packageId: string;
  packageTitle: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: Traveler[];
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  totalPrice: number;
  status: BookingStatus;
  statusHistory: StatusHistoryEntry[];
  paymentStatus: PaymentStatus;
  paymentId?: string;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

// ============ Document (Travel Vault) Types ============
export interface TravelDocument extends Models.Document {
  userId: string;
  fileName: string;
  fileId: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

// ============ Booking Draft (Local State) ============
export interface BookingDraft {
  packageId?: string;
  packageTitle?: string;
  destination?: string;
  packagePrice?: number;
  departureDate?: Date;
  returnDate?: Date;
  travelers: Traveler[];
  adultsCount: number;
  childrenCount: number;
  infantsCount: number;
  specialRequests?: string;
  currentStep: number;
}

// ============ Support Ticket Types ============
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface SupportTicket extends Models.Document {
  userId: string;
  subject: string;
  message: string;
  category: "booking" | "payment" | "general" | "tech_support";
  status: TicketStatus;
  priority: TicketPriority;
  bookingId?: string; // Optional link to a specific booking
  createdAt: string;
  updatedAt: string;
}

// ============ API Response Types ============
export interface ApiError {
  message: string;
  code: number;
  type: string;
}

export interface PaginatedResponse<T> {
  documents: T[];
  total: number;
}

// ============ Filter Types ============
export interface PackageFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: string;
  search?: string;
  ids?: string[];
  sortBy?: "price_asc" | "price_desc" | "rating" | "newest";
}
