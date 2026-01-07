/**
 * Appwrite TablesDB Services
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
    Review,
    SavedTraveler,
    SupportTicket,
    TravelDocument,
    TravelPackage,
} from "../types";
import { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, BUCKETS, DATABASE_ID, databases, ID, Query, storage, TABLES } from "./appwrite";

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
            queries.push(Query.orderDesc("$createdAt"));
            break;
        }
      }

      const response = await databases.listDocuments<TravelPackage>(
        DATABASE_ID,
        TABLES.PACKAGES,
        queries
      );

      // Parse itinerary JSON string to object
      const documents = response.documents.map(pkg => ({
        ...pkg,
        itinerary: typeof pkg.itinerary === "string" ? JSON.parse(pkg.itinerary || "[]") : pkg.itinerary,
      }));

      return {
        documents: documents as TravelPackage[],
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
      const pkg = await databases.getDocument<TravelPackage>(
        DATABASE_ID,
        TABLES.PACKAGES,
        packageId
      );
      return {
        ...pkg,
        itinerary: typeof pkg.itinerary === "string" ? JSON.parse(pkg.itinerary || "[]") : pkg.itinerary,
      } as TravelPackage;
    } catch {
      return null;
    }
  },

  /**
   * Get packages by category
   */
  async getPackagesByCategory(category: string, limit = 10): Promise<TravelPackage[]> {
    try {
      const response = await databases.listDocuments<TravelPackage>(
        DATABASE_ID,
        TABLES.PACKAGES,
        [
          Query.equal("isActive", true),
          Query.equal("category", category),
          Query.limit(limit),
        ]
      );
      return response.documents.map(pkg => ({
        ...pkg,
        itinerary: typeof pkg.itinerary === "string" ? JSON.parse(pkg.itinerary || "[]") : pkg.itinerary,
      })) as TravelPackage[];
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
      const response = await databases.listDocuments<TravelPackage>(
        DATABASE_ID,
        TABLES.PACKAGES,
        [
          Query.equal("isActive", true),
          Query.orderDesc("rating"),
          Query.limit(limit),
        ]
      );
      return response.documents.map(pkg => ({
        ...pkg,
        itinerary: typeof pkg.itinerary === "string" ? JSON.parse(pkg.itinerary || "[]") : pkg.itinerary,
      })) as TravelPackage[];
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
      const response = await databases.listDocuments<TravelPackage>(
        DATABASE_ID,
        TABLES.PACKAGES,
        [
          Query.equal("isActive", true),
          Query.search("title", query),
          Query.limit(limit),
        ]
      );
      return response.documents.map(pkg => ({
        ...pkg,
        itinerary: typeof pkg.itinerary === "string" ? JSON.parse(pkg.itinerary || "[]") : pkg.itinerary,
      })) as TravelPackage[];
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
  async createBooking(bookingData: Omit<Booking, "$id" | "createdAt" | "updatedAt" | "$createdAt" | "$updatedAt" | "$collectionId" | "$databaseId" | "$permissions" | "$sequence">): Promise<Booking> {
    try {
      const now = new Date().toISOString();
      const data = {
        ...bookingData,
        // Stringify complex objects for TablesDB
        travelers: JSON.stringify(bookingData.travelers),
        statusHistory: JSON.stringify(bookingData.statusHistory),
        createdAt: now,
        updatedAt: now,
      };
      
      const row = await databases.createDocument<Booking>(
        DATABASE_ID,
        TABLES.BOOKINGS,
        ID.unique(),
        data as any
      );

      return {
        ...row,
        travelers: typeof row.travelers === "string" ? JSON.parse(row.travelers) : row.travelers,
        statusHistory: typeof row.statusHistory === "string" ? JSON.parse(row.statusHistory) : row.statusHistory,
        createdAt: row.$createdAt,
        updatedAt: row.$updatedAt,
      } as Booking;
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
      const response = await databases.listDocuments<Booking>(
        DATABASE_ID,
        TABLES.BOOKINGS,
        [
          Query.equal("userId", userId),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents.map(booking => ({
        ...booking,
        travelers: typeof booking.travelers === "string" ? JSON.parse(booking.travelers) : booking.travelers,
        statusHistory: typeof booking.statusHistory === "string" ? JSON.parse(booking.statusHistory) : booking.statusHistory,
        createdAt: booking.$createdAt,
        updatedAt: booking.$updatedAt,
      })) as Booking[];
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
      const booking = await databases.getDocument<Booking>(
        DATABASE_ID,
        TABLES.BOOKINGS,
        bookingId
      );
      return {
        ...booking,
        travelers: typeof booking.travelers === "string" ? JSON.parse(booking.travelers) : booking.travelers,
        statusHistory: typeof booking.statusHistory === "string" ? JSON.parse(booking.statusHistory) : booking.statusHistory,
        createdAt: booking.$createdAt,
        updatedAt: booking.$updatedAt,
      } as Booking;
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

      const updatedHistory = [...current.statusHistory, statusHistoryEntry];

      const row = await databases.updateDocument<Booking>(
        DATABASE_ID,
        TABLES.BOOKINGS,
        bookingId,
        {
          status,
          statusHistory: JSON.stringify(updatedHistory),
          updatedAt: new Date().toISOString(),
        } as any
      );
      
      return {
        ...row,
        travelers: typeof row.travelers === "string" ? JSON.parse(row.travelers) : row.travelers,
        statusHistory: typeof row.statusHistory === "string" ? JSON.parse(row.statusHistory) : row.statusHistory,
        createdAt: row.$createdAt,
        updatedAt: row.$updatedAt,
      } as Booking;
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
      const row = await databases.updateDocument<Booking>(
        DATABASE_ID,
        TABLES.BOOKINGS,
        bookingId,
        {
          paymentStatus,
          paymentId,
          updatedAt: new Date().toISOString(),
        }
      );
      return {
        ...row,
        travelers: typeof row.travelers === "string" ? JSON.parse(row.travelers) : row.travelers,
        statusHistory: typeof row.statusHistory === "string" ? JSON.parse(row.statusHistory) : row.statusHistory,
        createdAt: row.$createdAt,
        updatedAt: row.$updatedAt,
      } as Booking;
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
   * Upload a document - Note: File upload requires Storage API
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
      // Construct file object for React Native
      const filePayload = {
        name: file.name,
        type: file.type,
        uri: file.uri,
        size: file.size,
      };

      // Upload to Storage
      const uploaded = await storage.createFile({
        bucketId: BUCKETS.TRAVEL_DOCUMENTS,
        fileId: ID.unique(),
        file: filePayload as any,
      });

      // Get view URL manually as SDK returns ArrayBuffer
      const fileUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKETS.TRAVEL_DOCUMENTS}/files/${uploaded.$id}/view?project=${APPWRITE_PROJECT_ID}`;
      
      const row = await databases.createDocument<TravelDocument>(
        DATABASE_ID,
        TABLES.DOCUMENTS,
        ID.unique(),
        {
          userId,
          fileName: file.name,
          fileId: uploaded.$id,
          fileUrl: fileUrl,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        }
      );

      return {
        ...row,
        uploadedAt: row.$createdAt,
      } as TravelDocument;
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
      const response = await databases.listDocuments<TravelDocument>(
        DATABASE_ID,
        TABLES.DOCUMENTS,
        [
          Query.equal("userId", userId),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents.map(doc => ({
        ...doc,
        uploadedAt: doc.$createdAt,
      })) as TravelDocument[];
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
      if (fileId) {
        try {
          await storage.deleteFile({
            bucketId: BUCKETS.TRAVEL_DOCUMENTS,
            fileId: fileId,
          });
        } catch (e) {
          console.warn("Failed to delete file from storage:", e);
        }
      }
      await databases.deleteDocument(
        DATABASE_ID,
        TABLES.DOCUMENTS,
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
  async createTicket(ticketData: Omit<SupportTicket, "$id" | "createdAt" | "updatedAt" | "$createdAt" | "$updatedAt" | "$collectionId" | "$databaseId" | "$permissions" | "$sequence">): Promise<SupportTicket> {
    try {
      const now = new Date().toISOString();
      const row = await databases.createDocument<SupportTicket>(
        DATABASE_ID,
        TABLES.TICKETS,
        ID.unique(),
        {
          ...ticketData,
          status: "open",
          createdAt: now,
          updatedAt: now,
        }
      );
      return {
        ...row,
        createdAt: row.$createdAt,
        updatedAt: row.$updatedAt,
      } as SupportTicket;
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
      const response = await databases.listDocuments<SupportTicket>(
        DATABASE_ID,
        TABLES.TICKETS,
        [
          Query.equal("userId", userId),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents.map(ticket => ({
        ...ticket,
        createdAt: ticket.$createdAt,
        updatedAt: ticket.$updatedAt,
      })) as SupportTicket[];
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
      const ticket = await databases.getDocument<SupportTicket>(
        DATABASE_ID,
        TABLES.TICKETS,
        ticketId
      );
      return {
        ...ticket,
        createdAt: ticket.$createdAt,
        updatedAt: ticket.$updatedAt,
      } as SupportTicket;
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
  async createTraveler(travelerData: Omit<SavedTraveler, "$id" | "createdAt" | "$createdAt" | "$updatedAt" | "$collectionId" | "$databaseId" | "$permissions" | "$sequence">): Promise<SavedTraveler> {
    try {
      const now = new Date().toISOString();
      const row = await databases.createDocument<SavedTraveler>(
        DATABASE_ID,
        TABLES.SAVED_TRAVELERS,
        ID.unique(),
        {
          ...travelerData,
          createdAt: now,
        }
      );
      return {
        ...row,
        createdAt: row.$createdAt,
      } as SavedTraveler;
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
      const response = await databases.listDocuments<SavedTraveler>(
        DATABASE_ID,
        TABLES.SAVED_TRAVELERS,
        [
          Query.equal("userId", userId),
          Query.orderDesc("$createdAt"),
        ]
      );
      return response.documents.map(traveler => ({
        ...traveler,
        createdAt: traveler.$createdAt,
      })) as SavedTraveler[];
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
        TABLES.SAVED_TRAVELERS,
        travelerId
      );
    } catch (error: any) {
      console.error("Delete traveler error:", error);
      throw new Error(error.message || "Failed to delete traveler");
    }
  },
};

// ============ Review Service ============

export const reviewService = {
  /**
   * Create a review
   */
  async createReview(reviewData: Omit<Review, "$id" | "createdAt" | "$createdAt" | "$updatedAt" | "$collectionId" | "$databaseId" | "$permissions" | "$sequence">): Promise<Review> {
    try {
      const now = new Date().toISOString();
      const row = await databases.createDocument<Review>(
        DATABASE_ID,
        TABLES.REVIEWS,
        ID.unique(),
        {
          ...reviewData,
          createdAt: now,
        }
      );
      
      return {
        ...row,
        createdAt: row.$createdAt,
      } as Review;
    } catch (error: any) {
      console.error("Create review error:", error);
      throw new Error(error.message || "Failed to submit review");
    }
  },

  /**
   * Get reviews for a package
   */
  async getPackageReviews(packageId: string, limit = 20): Promise<Review[]> {
    try {
      const response = await databases.listDocuments<Review>(
        DATABASE_ID,
        TABLES.REVIEWS,
        [
          Query.equal("packageId", packageId),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
        ]
      );
      return response.documents.map(review => ({
        ...review,
        createdAt: review.$createdAt,
      })) as Review[];
    } catch (error: any) {
      console.error("Get reviews error:", error);
      return [];
    }
  },
};

export default {
  packages: packageService,
  bookings: bookingService,
  documents: documentService,
  support: supportService,
  travelers: travelerService,
  reviews: reviewService,
};
