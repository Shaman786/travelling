/**
 * Appwrite Database Services
 * 
 * Handles all database operations for:
 * - Travel Packages
 * - Bookings
 * - Travel Documents
 * - Support Tickets
 */

import type {
    Booking,
    BookingStatus,
    PackageFilters,
    PaginatedResponse,
    SavedTraveler,
    SupportTicket,
    TravelDocument,
    TravelPackage
} from "../types";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, BUCKETS, COLLECTIONS, DATABASE_ID, databases, ID, Query, storage } from "./appwrite";

// ============ Package Service ============

export const packageService = {
  /**
   * Get all active packages with optional filters
   */
  async getPackages(filters?: PackageFilters, limit = 25, offset = 0): Promise<PaginatedResponse<TravelPackage>> {
    try {
      const queries: string[] = [
        Query.equal("isActive", true),
        Query.limit(limit),
        Query.offset(offset),
      ];

      // Apply filters
      if (filters?.category) {
        queries.push(Query.equal("category", filters.category));
      }
      if (filters?.minPrice) {
        queries.push(Query.greaterThanEqual("price", filters.minPrice));
      }
      if (filters?.maxPrice) {
        queries.push(Query.lessThanEqual("price", filters.maxPrice));
      }
      if (filters?.search) {
        queries.push(Query.search("title", filters.search));
      }
      if (filters?.ids && filters.ids.length > 0) {
        queries.push(Query.equal("$id", filters.ids));
      }

      // Apply sorting
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case "price_asc":
            queries.push(Query.orderAsc("price"));
            break;
          case "price_desc":
            queries.push(Query.orderDesc("price"));
            break;
          case "rating":
            queries.push(Query.orderDesc("rating"));
            break;
          case "newest":
            queries.push(Query.orderDesc("createdAt"));
            break;
        }
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PACKAGES,
        queries
      );

      return {
        documents: response.documents as unknown as TravelPackage[],
        total: response.total,
      };
    } catch (error: any) {
      console.error("Get packages error:", error);
      throw new Error(error.message || "Failed to fetch packages");
    }
  },

  /**
   * Get a single package by ID
   */
  async getPackageById(packageId: string): Promise<TravelPackage | null> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.PACKAGES,
        packageId
      );
      return doc as unknown as TravelPackage;
    } catch {
      return null;
    }
  },

  /**
   * Get packages by category
   */
  async getPackagesByCategory(category: string, limit = 10): Promise<TravelPackage[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PACKAGES,
        [
          Query.equal("isActive", true),
          Query.equal("category", category),
          Query.limit(limit),
        ]
      );
      return response.documents as unknown as TravelPackage[];
    } catch (error: any) {
      console.error("Get packages by category error:", error);
      return [];
    }
  },

  /**
   * Get featured/popular packages
   */
  async getFeaturedPackages(limit = 5): Promise<TravelPackage[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PACKAGES,
        [
          Query.equal("isActive", true),
          Query.orderDesc("rating"),
          Query.limit(limit),
        ]
      );
      return response.documents as unknown as TravelPackage[];
    } catch (error: any) {
      console.error("Get featured packages error:", error);
      return [];
    }
  },

  /**
   * Search packages by title or destination
   */
  async searchPackages(query: string, limit = 20): Promise<TravelPackage[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PACKAGES,
        [
          Query.equal("isActive", true),
          Query.or([
            Query.search("title", query),
            Query.search("destination", query),
            Query.search("country", query),
          ]),
          Query.limit(limit),
        ]
      );
      return response.documents as unknown as TravelPackage[];
    } catch (error: any) {
      console.error("Search packages error:", error);
      return [];
    }
  },
};

// ============ Booking Service ============

export const bookingService = {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: Omit<Booking, "$id" | "createdAt" | "updatedAt">): Promise<Booking> {
    try {
      const now = new Date().toISOString();
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKINGS,
        ID.unique(),
        {
          ...bookingData,
          createdAt: now,
          updatedAt: now,
        }
      );
      return doc as unknown as Booking;
    } catch (error: any) {
      console.error("Create booking error:", error);
      throw new Error(error.message || "Failed to create booking");
    }
  },

  /**
   * Get all bookings for a user
   */
  async getUserBookings(userId: string): Promise<Booking[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.BOOKINGS,
        [
          Query.equal("userId", userId),
          Query.orderDesc("createdAt"),
        ]
      );
      return response.documents as unknown as Booking[];
    } catch (error: any) {
      console.error("Get user bookings error:", error);
      return [];
    }
  },

  /**
   * Get a single booking by ID
   */
  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKINGS,
        bookingId
      );
      return doc as unknown as Booking;
    } catch {
      return null;
    }
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string, 
    status: BookingStatus, 
    note?: string
  ): Promise<Booking> {
    try {
      // Get current booking to append to status history
      const current = await this.getBookingById(bookingId);
      if (!current) throw new Error("Booking not found");

      const statusHistoryEntry = {
        status,
        date: new Date().toISOString(),
        note,
      };

      const doc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKINGS,
        bookingId,
        {
          status,
          statusHistory: [...current.statusHistory, statusHistoryEntry],
          updatedAt: new Date().toISOString(),
        }
      );
      return doc as unknown as Booking;
    } catch (error: any) {
      console.error("Update booking status error:", error);
      throw new Error(error.message || "Failed to update booking status");
    }
  },

  /**
   * Update payment status after Razorpay callback
   */
  async updatePaymentStatus(
    bookingId: string,
    paymentStatus: "paid" | "failed" | "refunded",
    paymentId?: string
  ): Promise<Booking> {
    try {
      const doc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKINGS,
        bookingId,
        {
          paymentStatus,
          paymentId,
          updatedAt: new Date().toISOString(),
        }
      );
      return doc as unknown as Booking;
    } catch (error: any) {
      console.error("Update payment status error:", error);
      throw new Error(error.message || "Failed to update payment status");
    }
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    return this.updateBookingStatus(bookingId, "cancelled", reason || "Cancelled by user");
  },
};

// ============ Document (Travel Vault) Service ============

export const documentService = {
  /**
   * Upload a document to storage and save metadata
   */
  async uploadDocument(
    userId: string,
    file: {
      uri: string;
      name: string;
      type: string;
      size: number;
    }
  ): Promise<TravelDocument> {
    try {
      // Upload file to storage
      const uploadedFile = await storage.createFile(
        BUCKETS.TRAVEL_DOCUMENTS,
        ID.unique(),
        {
          uri: file.uri,
          name: file.name,
          type: file.type,
          size: file.size,
        } as any
      );

      // Get file URL - Construct manually to avoid SDK type issues
      const fileUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKETS.TRAVEL_DOCUMENTS}/files/${uploadedFile.$id}/view?project=${APPWRITE_PROJECT_ID}`;

      // Save metadata to database
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        ID.unique(),
        {
          userId,
          fileName: file.name,
          fileId: uploadedFile.$id,
          fileUrl: fileUrl,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        }
      );

      return doc as unknown as TravelDocument;
    } catch (error: any) {
      console.error("Upload document error:", error);
      throw new Error(error.message || "Failed to upload document");
    }
  },

  /**
   * Get all documents for a user
   */
  async getUserDocuments(userId: string): Promise<TravelDocument[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        [
          Query.equal("userId", userId),
          Query.orderDesc("uploadedAt"),
        ]
      );
      return response.documents as unknown as TravelDocument[];
    } catch (error: any) {
      console.error("Get user documents error:", error);
      return [];
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string, fileId: string): Promise<void> {
    try {
      // Delete from storage
      await storage.deleteFile(BUCKETS.TRAVEL_DOCUMENTS, fileId);
      
      // Delete metadata
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.DOCUMENTS,
        documentId
      );
    } catch (error: any) {
      console.error("Delete document error:", error);
      throw new Error(error.message || "Failed to delete document");
    }
  },

  /**
   * Get download URL for a document
   */
  getDownloadUrl(fileId: string): string {
    return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKETS.TRAVEL_DOCUMENTS}/files/${fileId}/download?project=${APPWRITE_PROJECT_ID}`;
  },
};

// ============ Support Ticket Service ============

export const supportService = {
  /**
   * Create a support ticket
   */
  async createTicket(ticketData: Omit<SupportTicket, "$id" | "createdAt" | "updatedAt">): Promise<SupportTicket> {
    try {
      const now = new Date().toISOString();
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.TICKETS,
        ID.unique(),
        {
          ...ticketData,
          status: "open",
          createdAt: now,
          updatedAt: now,
        }
      );
      return doc as unknown as SupportTicket;
    } catch (error: any) {
      console.error("Create ticket error:", error);
      throw new Error(error.message || "Failed to create support ticket");
    }
  },

  /**
   * Get all tickets for a user
   */
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.TICKETS,
        [
          Query.equal("userId", userId),
          Query.orderDesc("createdAt"),
        ]
      );
      return response.documents as unknown as SupportTicket[];
    } catch (error: any) {
      console.error("Get user tickets error:", error);
      return [];
    }
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: string): Promise<SupportTicket | null> {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.TICKETS,
        ticketId
      );
      return doc as unknown as SupportTicket;
    } catch {
      return null;
    }
  },
};

// ============ Traveler Service (Saved) ============

export const travelerService = {
  /**
   * Add a saved traveler
   */
  async createTraveler(travelerData: Omit<SavedTraveler, "$id" | "createdAt">): Promise<SavedTraveler> {
    try {
      const now = new Date().toISOString();
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.SAVED_TRAVELERS,
        ID.unique(),
        {
          ...travelerData,
          createdAt: now,
        }
      );
      return doc as unknown as SavedTraveler;
    } catch (error: any) {
      console.error("Create traveler error:", error);
      throw new Error(error.message || "Failed to add traveler");
    }
  },

  /**
   * Get user's saved travelers
   */
  async getUserTravelers(userId: string): Promise<SavedTraveler[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SAVED_TRAVELERS,
        [
          Query.equal("userId", userId),
          Query.orderDesc("createdAt"),
        ]
      );
      return response.documents as unknown as SavedTraveler[];
    } catch (error: any) {
      console.error("Get travelers error:", error);
      return [];
    }
  },

  /**
   * Delete a saved traveler
   */
  async deleteTraveler(travelerId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.SAVED_TRAVELERS,
        travelerId
      );
    } catch (error: any) {
      console.error("Delete traveler error:", error);
      throw new Error(error.message || "Failed to delete traveler");
    }
  },
};

export default {
  packages: packageService,
  bookings: bookingService,
  documents: documentService,
  support: supportService,
  travelers: travelerService,
};
