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
  Addon,
  Booking,
  BookingStatus,
  Message,
  PackageFilters,
  PaginatedResponse,
  Payment,
  Review,
  SavedTraveler,
  SupportTicket,
  TicketMessage,
  TravelDocument,
  TravelPackage,
} from "../types";
import {
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
  BUCKETS,
  DATABASE_ID,
  Query,
  storage,
  tables,
  TABLES,
} from "./appwrite";
import { generateBookingRef, generateId } from "./id";

// ============ Payment Service ============

// ============ Package Service ============

export const packageService = {
  /**
   * Get all active packages with optional filters
   */
  async getPackages(
    filters?: PackageFilters,
    limit = 25,
    offset = 0
  ): Promise<PaginatedResponse<TravelPackage>> {
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

      // Advanced Filters
      if (filters?.rating) {
        queries.push(Query.greaterThanEqual("rating", filters.rating));
      }

      if (filters?.duration) {
        // Duration logic: "Short" (<3), "Medium" (3-7), "Long" (>7)
        // Store duration as "X Days". We need to filter based on this string.
        // Simplified approach: Search for "Day" + regex or assume backend structure.
        // Better: Appwrite doesn't support regex on string fields easily in all versions.
        // Best effort: Client-side filtering if volume is low, or structured query if data is consistent.
        // Assuming data is "X Days...", we can't easily do numeric comparison on string "7 Days".
        // Workaround: We will fetch and filter in memory for Duration OR rely on a new numeric field `durationDays` if we had one.
        // Since we don't have schema control right now, let's try searching for keywords if "Short/Medium/Long" matches,
        // OR we just omit it here and filter in-memory if needed.
        // Let's implement in-memory filtering for Duration after fetch for now to ensure correctness without schema changes.
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

      queries.push(
        Query.select([
          "$id",
          "title",
          "destination",
          "price",
          "imageUrl",
          "rating",
          "reviewCount",
          "duration",
          "category",
          "isActive",
        ])
      );

      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.PACKAGES,
        queries,
      });

      // Parse itinerary JSON string to object
      const rows = response.rows.map((pkg: any) => ({
        ...pkg,
        itinerary:
          typeof pkg.itinerary === "string"
            ? JSON.parse(pkg.itinerary || "[]")
            : pkg.itinerary,
      }));

      return {
        documents: rows as TravelPackage[],
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
      const pkg = (await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.PACKAGES,
        rowId: packageId,
      })) as any;
      return {
        ...pkg,
        itinerary:
          typeof pkg.itinerary === "string"
            ? JSON.parse(pkg.itinerary || "[]")
            : pkg.itinerary,
      } as TravelPackage;
    } catch {
      return null;
    }
  },

  /**
   * Get packages by category
   */
  async getPackagesByCategory(
    category: string,
    limit = 10
  ): Promise<TravelPackage[]> {
    try {
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.PACKAGES,
        queries: [
          Query.equal("isActive", true),
          Query.equal("category", category),
          Query.limit(limit),
          Query.select([
            "$id",
            "title",
            "destination",
            "price",
            "imageUrl",
            "rating",
            "reviewCount",
            "duration",
            "category",
            "isActive",
            "itinerary",
          ]),
        ],
      });
      // Itinerary might still be needed for parsing, even if empty/partial
      return response.rows.map((pkg: any) => ({
        ...pkg,
        itinerary:
          typeof pkg.itinerary === "string"
            ? JSON.parse(pkg.itinerary || "[]")
            : pkg.itinerary,
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
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.PACKAGES,
        queries: [
          Query.equal("isActive", true),
          Query.orderDesc("rating"),
          Query.limit(limit),
          Query.select([
            "$id",
            "title",
            "destination",
            "price",
            "imageUrl",
            "rating",
            "reviewCount",
            "duration",
            "category",
            "isActive",
            "itinerary",
          ]),
        ],
      });
      return response.rows.map((pkg: any) => ({
        ...pkg,
        itinerary:
          typeof pkg.itinerary === "string"
            ? JSON.parse(pkg.itinerary || "[]")
            : pkg.itinerary,
      })) as TravelPackage[];
    } catch (error: any) {
      console.error("Get featured packages error:", error);
      return [];
    }
  },

  /**
   * Search packages by title OR destination
   * Performs two queries and merges results since OR queries are not native for search yet
   */
  async searchPackages(query: string, limit = 20): Promise<TravelPackage[]> {
    try {
      // Run queries in parallel
      const [titleResults, destResults] = await Promise.all([
        tables.listRows({
          databaseId: DATABASE_ID,
          tableId: TABLES.PACKAGES,
          queries: [
            Query.equal("isActive", true),
            Query.search("title", query),
            Query.limit(limit),
          ],
        }),
        tables.listRows({
          databaseId: DATABASE_ID,
          tableId: TABLES.PACKAGES,
          queries: [
            Query.equal("isActive", true),
            Query.search("destination", query),
            Query.limit(limit),
          ],
        }),
      ]);

      // Merge and Deduplicate
      const allDocs = [...titleResults.rows, ...destResults.rows] as any[];
      const seen = new Set<string>();
      const uniqueDocs: TravelPackage[] = [];

      for (const doc of allDocs) {
        if (!seen.has(doc.$id)) {
          seen.add(doc.$id);
          uniqueDocs.push(doc);
        }
      }

      return uniqueDocs.map((pkg) => ({
        ...pkg,
        itinerary:
          typeof pkg.itinerary === "string"
            ? JSON.parse(pkg.itinerary || "[]")
            : pkg.itinerary,
      })) as TravelPackage[];
    } catch (error: any) {
      console.error("Search packages error:", error);
      return [];
    }
  },

  /**
   * Get unique categories from active packages
   * Note: This is a client-side aggregation as Appwrite doesn't support SELECT DISTINCT yet.
   */
  async getUniqueCategories(): Promise<{ id: string; name: string }[]> {
    try {
      // Fetch a larger set to ensure we capture most categories
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.PACKAGES,
        queries: [
          Query.equal("isActive", true),
          Query.limit(100),
          Query.select(["category"]),
        ],
      });

      const uniqueCats = new Set<string>();
      response.rows.forEach((pkg: any) => {
        if (pkg.category) {
          // Normalize: Capitalize first letter
          const cat = pkg.category.trim();
          uniqueCats.add(cat);
        }
      });

      return Array.from(uniqueCats)
        .map((cat) => ({
          id: cat.toLowerCase(),
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error: any) {
      console.error("Get categories error:", error);
      // Fallback to default if fetch fails
      return [
        { id: "india", name: "India" },
        { id: "gulf", name: "Gulf" },
        { id: "uk", name: "UK & Europe" },
        { id: "usa", name: "USA" },
        { id: "asia", name: "Asia" },
      ];
    }
  },
};

// ============ Booking Service ============

export const bookingService = {
  /**
   * Create a new booking
   */
  async createBooking(
    bookingData: Omit<
      Booking,
      | "$id"
      | "createdAt"
      | "updatedAt"
      | "$createdAt"
      | "$updatedAt"
      | "$collectionId"
      | "$databaseId"
      | "$permissions"
      | "$sequence"
    >
  ): Promise<Booking> {
    try {
      // Destructure to remove fields that don't exist in Appwrite schema
      // We keep packageTitle as it seems to be required by Appwrite schema
      const { packageImageUrl, ...cleanedData } = bookingData as any;

      const data = {
        ...cleanedData,
        // Map packageTitle to packageName for Appwrite schema compatibility (if needed)
        packageName: bookingData.packageTitle,
        // Stringify complex objects for TablesDB
        travelers: JSON.stringify(bookingData.travelers),
        statusHistory: JSON.stringify(bookingData.statusHistory),
      };

      const bookingRef = generateBookingRef();
      const updatedData = {
        ...data,
        bookingRef, // Add short ID
      };

      const row = (await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOKINGS,
        rowId: generateId(),
        data: updatedData as any,
      })) as any;

      return {
        ...row,
        travelers:
          typeof row.travelers === "string"
            ? JSON.parse(row.travelers)
            : row.travelers,
        statusHistory:
          typeof row.statusHistory === "string"
            ? JSON.parse(row.statusHistory)
            : row.statusHistory,
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
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOKINGS,
        queries: [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
      });
      return response.rows.map((booking: any) => ({
        ...booking,
        travelers:
          typeof booking.travelers === "string"
            ? JSON.parse(booking.travelers)
            : booking.travelers,
        statusHistory:
          typeof booking.statusHistory === "string"
            ? JSON.parse(booking.statusHistory)
            : booking.statusHistory,
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
      const booking = (await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOKINGS,
        rowId: bookingId,
      })) as any;
      return {
        ...booking,
        travelers:
          typeof booking.travelers === "string"
            ? JSON.parse(booking.travelers)
            : booking.travelers,
        statusHistory:
          typeof booking.statusHistory === "string"
            ? JSON.parse(booking.statusHistory)
            : booking.statusHistory,
        createdAt: booking.$createdAt,
        updatedAt: booking.$updatedAt,
      } as Booking;
    } catch {
      return null;
    }
  },

  /**
   * Create a payment record
   */
  async createPayment(paymentData: any): Promise<any> {
    // try/catch removed to allow errors to propagate to the caller (ReviewScreen)
    // where they will be caught and displayed to the user.
    const response = await tables.createRow({
      databaseId: DATABASE_ID,
      tableId: TABLES.PAYMENTS,
      rowId: generateId(),
      data: {
        ...paymentData,
      },
    });
    return response;
  },

  /**
   * Confirm booking payment
   * Updates status to processing and paymentStatus to paid
   */
  async confirmBookingPayment(
    bookingId: string,
    paymentIntentId: string
  ): Promise<any> {
    // Changing return type to any as transaction result differs
    try {
      console.log("Initiating Atomic Payment Transaction (TablesDB)...");

      // 1. Create Transaction
      const transaction = await tables.createTransaction();
      const transactionId = transaction.$id;
      console.log(`Transaction Created: ${transactionId}`);

      // 2. Prepare Operations
      // Fetch booking using TablesDB (Correct Modern API)
      const booking = (await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOKINGS,
        rowId: bookingId,
      })) as unknown as Booking;

      // Parse statusHistory if it's a string (backwards compatibility)
      const currentHistory =
        typeof booking.statusHistory === "string"
          ? JSON.parse(booking.statusHistory)
          : booking.statusHistory;

      const statusHistoryEntry = {
        status: "processing",
        date: new Date().toISOString(),
        note: `Payment confirmed via Airwallex (ID: ${paymentIntentId})`,
      };

      const updatedHistory = JSON.stringify([
        ...currentHistory,
        statusHistoryEntry,
      ]);
      const paymentId = generateId();

      // Define Operations
      const operations = [
        // Operation 1: Update Booking Status
        {
          action: "update",
          databaseId: DATABASE_ID,
          tableId: TABLES.BOOKINGS,
          rowId: bookingId,
          data: {
            status: "processing",
            paymentStatus: "paid",
            paymentId: paymentIntentId,
            statusHistory: updatedHistory,
          },
        },
        // Operation 2: Create Payment Record
        {
          action: "create",
          databaseId: DATABASE_ID,
          tableId: TABLES.PAYMENTS,
          rowId: paymentId,
          data: {
            bookingId: bookingId,
            userId: booking.userId,
            amount: booking.totalPrice,
            currency: "USD",
            gatewayProvider: "airwallex",
            gatewayOrderId: paymentIntentId,
            gatewayPaymentId: paymentIntentId,
            status: "completed",
            method: "card",
          },
        },
      ];

      // 3. Stage Operations
      await tables.createOperations({
        transactionId: transactionId,
        operations: operations as any,
      });

      // 4. Commit Transaction
      console.log("Committing Transaction...");
      await tables.updateTransaction({
        transactionId: transactionId,
        commit: true,
      });

      console.log("Transaction Committed Successfully ✅");
      return booking; // Return the booking object (state might be slightly stale but UI has optimistic update)
    } catch (error: any) {
      console.error("Transaction Failed ❌:", error);
      throw error;
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

      const row = (await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOKINGS,
        rowId: bookingId,
        data: {
          status,
          statusHistory: JSON.stringify(updatedHistory),
        },
      })) as any;

      return {
        ...row,
        travelers:
          typeof row.travelers === "string"
            ? JSON.parse(row.travelers)
            : row.travelers,
        statusHistory:
          typeof row.statusHistory === "string"
            ? JSON.parse(row.statusHistory)
            : row.statusHistory,
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
      const row = (await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.BOOKINGS,
        rowId: bookingId,
        data: {
          paymentStatus,
          paymentId,
        },
      })) as any;
      return {
        ...row,
        travelers:
          typeof row.travelers === "string"
            ? JSON.parse(row.travelers)
            : row.travelers,
        statusHistory:
          typeof row.statusHistory === "string"
            ? JSON.parse(row.statusHistory)
            : row.statusHistory,
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
    return this.updateBookingStatus(
      bookingId,
      "cancelled",
      reason || "Cancelled by user"
    );
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
        fileId: generateId(),
        file: filePayload as any,
      });

      // Get view URL manually as SDK returns ArrayBuffer
      const fileUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKETS.TRAVEL_DOCUMENTS}/files/${uploaded.$id}/view?project=${APPWRITE_PROJECT_ID}`;

      const row = (await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.DOCUMENTS,
        rowId: generateId(),
        data: {
          userId,
          fileName: file.name,
          fileId: uploaded.$id,
          fileUrl: fileUrl,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        },
      })) as any;

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
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.DOCUMENTS,
        queries: [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
      });
      return response.rows.map((doc: any) => ({
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
      await tables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.DOCUMENTS,
        rowId: documentId,
      });
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
  async createTicket(
    ticketData: Omit<
      SupportTicket,
      | "$id"
      | "createdAt"
      | "updatedAt"
      | "$createdAt"
      | "$updatedAt"
      | "$collectionId"
      | "$databaseId"
      | "$permissions"
      | "$sequence"
    >
  ): Promise<SupportTicket> {
    try {
      const row = (await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.TICKETS,
        rowId: generateId(),
        data: {
          ...ticketData,
          status: "open",
        },
      })) as any;
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
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.TICKETS,
        queries: [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
      });
      return response.rows.map((ticket: any) => ({
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
      const ticket = (await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.TICKETS,
        rowId: ticketId,
      })) as any;
      return {
        ...ticket,
        createdAt: ticket.$createdAt,
        updatedAt: ticket.$updatedAt,
      } as SupportTicket;
    } catch {
      return null;
    }
  },

  /**
   * Get messages for a ticket
   */
  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    try {
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.MESSAGES,
        queries: [
          Query.equal("ticketId", ticketId),
          Query.orderAsc("createdAt"),
        ],
      });
      return response.rows.map((msg: any) => ({
        ...msg,
        createdAt: msg.$createdAt,
      })) as TicketMessage[];
    } catch (error: any) {
      console.error("Get messages error:", error);
      return [];
    }
  },

  /**
   * Send a message on a ticket
   */
  async sendTicketMessage(
    messageData: Omit<
      TicketMessage,
      | "$id"
      | "createdAt"
      | "$createdAt"
      | "$updatedAt"
      | "$collectionId"
      | "$databaseId"
      | "$permissions"
      | "updatedAt"
    >
  ): Promise<TicketMessage> {
    try {
      const row = (await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.MESSAGES,
        rowId: generateId(),
        data: {
          ...messageData,
        },
      })) as any;
      return {
        ...row,
        createdAt: row.$createdAt,
      } as TicketMessage;
    } catch (error: any) {
      console.error("Send message error:", error);
      throw new Error(error.message || "Failed to send message");
    }
  },

  /**
   * Update ticket status
   */
  async updateTicketStatus(
    ticketId: string,
    status: SupportTicket["status"]
  ): Promise<void> {
    try {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.TICKETS,
        rowId: ticketId,
        data: {
          status,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      console.error("Update status error:", error);
      throw new Error(error.message || "Failed to update ticket status");
    }
  },
};

// ============ Add-on Service ============

export const addonService = {
  /**
   * Get all active add-ons
   */
  async getAddons(): Promise<Addon[]> {
    try {
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.ADDONS,
        queries: [Query.equal("isActive", true)],
      });
      return response.rows as unknown as Addon[];
    } catch (error: any) {
      console.error("Get add-ons error:", error);
      return [];
    }
  },
};

// ============ Traveler Service (Saved) ============

export const travelerService = {
  /**
   * Add a saved traveler
   */
  async createTraveler(
    travelerData: Omit<
      SavedTraveler,
      | "$id"
      | "createdAt"
      | "$createdAt"
      | "$updatedAt"
      | "$collectionId"
      | "$databaseId"
      | "$permissions"
      | "$sequence"
    >
  ): Promise<SavedTraveler> {
    try {
      const row = (await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.SAVED_TRAVELERS,
        rowId: generateId(),
        data: {
          ...travelerData,
        },
      })) as any;
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
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.SAVED_TRAVELERS,
        queries: [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
      });
      return response.rows.map((traveler: any) => ({
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
      await tables.deleteRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.SAVED_TRAVELERS,
        rowId: travelerId,
      });
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
  async createReview(
    reviewData: Omit<
      Review,
      | "$id"
      | "createdAt"
      | "$createdAt"
      | "$updatedAt"
      | "$collectionId"
      | "$databaseId"
      | "$permissions"
      | "$sequence"
    >
  ): Promise<Review> {
    try {
      const row = (await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.REVIEWS,
        rowId: generateId(),
        data: {
          ...reviewData,
        },
      })) as any;

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
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.REVIEWS,
        queries: [
          Query.equal("packageId", packageId),
          Query.orderDesc("$createdAt"),
          Query.limit(limit),
        ],
      });
      return response.rows.map((review: any) => ({
        ...review,
        createdAt: review.$createdAt,
      })) as Review[];
    } catch (error: any) {
      console.error("Get reviews error:", error);
      return [];
    }
  },
};

export const paymentService = {
  /**
   * Create a new payment record
   */
  async createPayment(paymentData: {
    bookingId: string;
    userId: string;
    amount: number;
    currency: string;
    gatewayProvider?: string;
    gatewayOrderId?: string;
  }): Promise<Payment> {
    try {
      const payment = await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.PAYMENTS,
        rowId: generateId(),
        data: {
          ...paymentData,
          status: "pending",
        },
      });
      return payment as unknown as Payment;
    } catch (error: any) {
      console.error("Create payment error:", error);
      throw new Error(error.message || "Failed to create payment");
    }
  },

  /**
   * Get payment by booking ID
   */
  async getPaymentByBookingId(bookingId: string): Promise<Payment | null> {
    try {
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.PAYMENTS,
        queries: [Query.equal("bookingId", bookingId), Query.limit(1)],
      });
      if (response.rows.length > 0) {
        return response.rows[0] as unknown as Payment;
      }
      return null;
    } catch (error: any) {
      console.error("Get payment error:", error);
      return null;
    }
  },

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment | null> {
    try {
      const payment = await tables.getRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.PAYMENTS,
        rowId: paymentId,
      });
      return payment as unknown as Payment;
    } catch (error: any) {
      console.error("Get payment error:", error);
      return null;
    }
  },

  /**
   * Get all payments for a user
   */
  async getUserPayments(userId: string): Promise<Payment[]> {
    try {
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.PAYMENTS,
        queries: [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
      });
      return response.rows as unknown as Payment[];
    } catch (error: any) {
      console.error("Get user payments error:", error);
      return [];
    }
  },

  /**
   * Update payment after gateway callback
   */
  async updatePaymentFromGateway(
    paymentId: string,
    gatewayData: {
      gatewayPaymentId: string;
      gatewaySignature?: string;
      status: "completed" | "failed";
      method?: string;
      metadata?: string;
    }
  ): Promise<Payment> {
    try {
      const payment = await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.PAYMENTS,
        rowId: paymentId,
        data: {
          ...gatewayData,
          updatedAt: new Date().toISOString(),
        },
      });
      return payment as unknown as Payment;
    } catch (error: any) {
      console.error("Update payment error:", error);
      throw new Error(error.message || "Failed to update payment");
    }
  },

  /**
   * Process refund
   */
  async processRefund(
    paymentId: string,
    refundData: {
      refundId: string;
      refundAmount: number;
      refundReason?: string;
    }
  ): Promise<Payment> {
    try {
      const payment = await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.PAYMENTS,
        rowId: paymentId,
        data: {
          status: "refunded",
          ...refundData,
          updatedAt: new Date().toISOString(),
        },
      });
      return payment as unknown as Payment;
    } catch (error: any) {
      console.error("Process refund error:", error);
      throw new Error(error.message || "Failed to process refund");
    }
  },

  /**
   * Get all payments (admin)
   */
  async getAllPayments(limit = 50): Promise<Payment[]> {
    try {
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.PAYMENTS,
        queries: [Query.orderDesc("$createdAt"), Query.limit(limit)],
      });
      return response.rows as unknown as Payment[];
    } catch (error: any) {
      console.error("Get all payments error:", error);
      return [];
    }
  },

  /**
   * Update payment record (generic update)
   */
  async updatePayment(
    paymentId: string,
    data: Partial<{
      gatewayOrderId: string;
      gatewayPaymentId: string;
      gatewaySignature: string;
      status: "pending" | "processing" | "completed" | "failed" | "refunded";
      method: string;
      metadata: string;
    }>
  ): Promise<Payment> {
    try {
      const payment = await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.PAYMENTS,
        rowId: paymentId,
        data: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });
      return payment as unknown as Payment;
    } catch (error: any) {
      console.error("Update payment error:", error);
      throw new Error(error.message || "Failed to update payment");
    }
  },
};

// ============ Banner Service ============

export const bannerService = {
  /**
   * Get active banners sorted by sortOrder
   */
  async getBanners(): Promise<import("../types").Banner[]> {
    try {
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.BANNERS,
        queries: [Query.equal("isActive", true), Query.orderAsc("sortOrder")],
      });

      return response.rows.map((banner: any) => ({
        ...banner,
        createdAt: banner.$createdAt,
        updatedAt: banner.$updatedAt,
      })) as import("../types").Banner[];
    } catch (error: any) {
      console.error("Get banners error:", error);
      return [];
    }
  },
};

// ============ Consultation Service ============

export const consultationService = {
  /**
   * Create a new consultation request
   */
  async createConsultation(data: any): Promise<any> {
    try {
      const row = await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.CONSULTATIONS,
        rowId: generateId(),
        data: {
          ...data,
          status: "new",
        },
      });
      return row;
    } catch (error: any) {
      console.error("Create consultation error:", error);
      throw new Error(error.message || "Failed to submit request");
    }
  },

  /**
   * Get consultations (Admin)
   */
  async getConsultations(status?: string): Promise<any[]> {
    try {
      const queries = [Query.orderDesc("$createdAt")];
      if (status && status !== "all") {
        queries.push(Query.equal("status", status));
      }

      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.CONSULTATIONS,
        queries,
      });
      return response.rows;
    } catch (error: any) {
      console.error("Get consultations error:", error);
      return [];
    }
  },

  /**
   * Update consultation status
   */
  async updateStatus(id: string, status: string): Promise<void> {
    try {
      await tables.updateRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.CONSULTATIONS,
        rowId: id,
        data: { status, updatedAt: new Date().toISOString() },
      });
    } catch (error: any) {
      throw new Error(error.message || "Failed to update status");
    }
  },
};

// ============ Chat Service ============

export const chatService = {
  /**
   * Send a message
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    senderName?: string
  ): Promise<Message> {
    try {
      const row = (await tables.createRow({
        databaseId: DATABASE_ID,
        tableId: TABLES.CHAT_MESSAGES,
        rowId: generateId(),
        data: {
          conversationId,
          senderId,
          content,
          senderName,
          read: false,
        },
      })) as any;

      return {
        ...row,
        createdAt: row.$createdAt,
      } as Message;
    } catch (error: any) {
      console.error("Send message error:", error);
      throw new Error(error.message || "Failed to send message");
    }
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    try {
      const response = await tables.listRows({
        databaseId: DATABASE_ID,
        tableId: TABLES.CHAT_MESSAGES,
        queries: [
          Query.equal("conversationId", conversationId),
          Query.orderDesc("$createdAt"), // Latest first for UI
          Query.limit(limit),
          Query.offset(offset),
        ],
      });

      return response.rows.map((msg: any) => ({
        ...msg,
        createdAt: msg.$createdAt,
      })) as Message[];
    } catch (error: any) {
      console.error("Get messages error:", error);
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
  payments: paymentService,
  addons: addonService,
  banners: bannerService,
  consultations: consultationService,
  chat: chatService,
};
