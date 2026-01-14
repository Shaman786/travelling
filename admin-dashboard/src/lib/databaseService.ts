import { Models, Query } from "appwrite";
import { DATABASE_ID, databases, ID, TABLES } from "./appwrite";

// Types (simplified for Admin)
export interface TravelPackage extends Models.Document {
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  mainImage: string;
  images: string[];
  destination: string;
  duration: string;
  category: string;
  rating: number;
  reviews: number;
  itinerary: any[]; // JSON string or array
  inclusions: string[];
  exclusions: string[];
  isActive: boolean;
}

export interface Booking extends Models.Document {
  userId: string;
  packageId: string;
  packageName: string;
  travelDate: string;
  travelers: number; // or object
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  contactName: string;
}

export interface Addon extends Models.Document {
  name: string;
  description: string;
  price: number;
  type: "per_person" | "per_booking";
  icon: string;
  isActive: boolean;
}

export const databaseService = {
  // ============ PACKAGES ============
  packages: {
    async list(limit = 100) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          TABLES.PACKAGES,
          [Query.orderDesc("$createdAt"), Query.limit(limit)],
        );
        return response.documents;
      } catch (error) {
        console.error("List packages error:", error);
        return [];
      }
    },
    async get(id: string) {
      try {
        return await databases.getDocument(DATABASE_ID, TABLES.PACKAGES, id);
      } catch (error) {
        console.error("Get package error:", error);
        return null;
      }
    },
    async create(data: any) {
      try {
        return await databases.createDocument(
          DATABASE_ID,
          TABLES.PACKAGES,
          ID.unique(),
          {
            ...data,
            isActive: true,
            createdAt: new Date().toISOString(),
            // Ensure itinerary is stringified if needed, but array is supported in recent Appwrite
          },
        );
      } catch (error) {
        console.error("Create package error:", error);
        throw error;
      }
    },
    async update(id: string, data: any) {
      try {
        return await databases.updateDocument(
          DATABASE_ID,
          TABLES.PACKAGES,
          id,
          data,
        );
      } catch (error) {
        console.error("Update package error:", error);
        throw error;
      }
    },
    async delete(id: string) {
      try {
        // Soft delete
        return await databases.updateDocument(
          DATABASE_ID,
          TABLES.PACKAGES,
          id,
          { isActive: false },
        );
      } catch (error) {
        console.error("Delete package error:", error);
        throw error;
      }
    },
  },

  // ============ BOOKINGS ============
  bookings: {
    async list(limit = 100) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          TABLES.BOOKINGS,
          [Query.orderDesc("$createdAt"), Query.limit(limit)],
        );
        return response.documents;
      } catch (error) {
        console.error("List bookings error:", error);
        return [];
      }
    },
    async get(id: string) {
      try {
        return await databases.getDocument(DATABASE_ID, TABLES.BOOKINGS, id);
      } catch (error) {
        console.error("Get booking error:", error);
        return null;
      }
    },
    async updateStatus(id: string, status: string) {
      try {
        return await databases.updateDocument(
          DATABASE_ID,
          TABLES.BOOKINGS,
          id,
          { status },
        );
      } catch (error) {
        console.error("Update booking status error:", error);
        throw error;
      }
    },
  },

  // ============ ADDONS ============
  addons: {
    async list(limit = 100) {
      try {
        const response = await databases.listDocuments<Addon>(
          DATABASE_ID,
          TABLES.ADDONS,
          [Query.equal("isActive", true), Query.limit(limit)],
        );
        return response.documents;
      } catch (error) {
        console.error("List addons error:", error);
        return [];
      }
    },
    async create(data: Omit<Addon, keyof Models.Document | "isActive">) {
      try {
        return await databases.createDocument(
          DATABASE_ID,
          TABLES.ADDONS,
          ID.unique(),
          {
            ...data,
            isActive: true,
          },
        );
      } catch (error) {
        console.error("Create addon error:", error);
        throw error;
      }
    },
    async delete(id: string) {
      try {
        // Soft delete
        return await databases.updateDocument(DATABASE_ID, TABLES.ADDONS, id, {
          isActive: false,
        });
      } catch (error) {
        console.error("Delete addon error:", error);
        throw error;
      }
    },
  },

  // ============ USERS ============
  users: {
    async list(limit = 100) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          TABLES.USERS,
          [Query.orderDesc("$createdAt"), Query.limit(limit)],
        );
        return response.documents;
      } catch (error) {
        console.warn("List users error:", error);
        return [];
      }
    },
    async count() {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          TABLES.USERS,
          [Query.limit(0)],
        );
        return response.total;
      } catch {
        return 0;
      }
    },
  },

  // ============ ADMINS ============
  admins: {
    async list(limit = 100) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          TABLES.ADMINS,
          [Query.orderDesc("$createdAt"), Query.limit(limit)],
        );
        return response.documents;
      } catch (error) {
        console.error("List admins error:", error);
        return [];
      }
    },
    async create(data: any) {
      // Note: Creating an admin usually involves creating an Appwrite Auth User first + Team membership
      // This function might just create the profile, or handle both if extended.
      try {
        return await databases.createDocument(
          DATABASE_ID,
          TABLES.ADMINS,
          ID.unique(),
          {
            ...data,
            isActive: true,
          },
        );
      } catch (error) {
        console.error("Create admin profile error:", error);
        throw error;
      }
    },
  },

  // ============ PAYMENTS ============
  payments: {
    async list(limit = 100, search?: string) {
      // Added search
      try {
        const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];
        if (search) {
          // Gateway IDs can be long
          if (
            search.startsWith("pay_") ||
            search.startsWith("order_") ||
            search.length > 10
          ) {
            // Try finding by gatewayPaymentId or OrderId?
            // Appwrite doesn't support OR ideally without 'Query.or' (which we might have).
            // Let's assume exact match on gatewayPaymentId for now as primary "Transaction ID" search
            queries.push(Query.equal("gatewayPaymentId", search));
          } else {
            // Maybe search booking ID?
            queries.push(Query.equal("bookingId", search));
          }
        }
        const response = await databases.listDocuments(
          DATABASE_ID,
          TABLES.PAYMENTS,
          queries,
        );
        return response.documents;
      } catch (error) {
        console.error("List payments error:", error);
        return [];
      }
    },
  },

  // ============ SUPPORT ============
  support: {
    async list(limit = 100, status?: string, search?: string) {
      // Added search
      try {
        const queries = [Query.orderDesc("$createdAt"), Query.limit(limit)];
        if (status && status !== "all") {
          queries.push(Query.equal("status", status));
        }
        if (search) {
          // Search by ID or Subject
          // Note: OR queries are supported in newer Appwrite versions.
          // If ID-like (36 chars), try exact match. Else fulltext
          if (search.length === 20) {
            // Appwrite IDs are usually 20 chars
            queries.push(Query.equal("$id", search));
          } else {
            queries.push(Query.search("subject", search));
          }
        }
        const response = await databases.listDocuments(
          DATABASE_ID,
          TABLES.TICKETS,
          queries,
        );
        return response.documents;
      } catch (error) {
        console.error("List tickets error:", error);
        return [];
      }
    },
    async get(id: string) {
      try {
        return await databases.getDocument(DATABASE_ID, TABLES.TICKETS, id);
      } catch (error) {
        console.error("Get ticket error:", error);
        return null;
      }
    },
    async getMessages(ticketId: string) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          TABLES.MESSAGES,
          [Query.equal("ticketId", ticketId), Query.orderAsc("createdAt")],
        );
        return response.documents;
      } catch (error) {
        console.error("Get ticket messages error:", error);
        return [];
      }
    },
    async updateStatus(id: string, status: string) {
      try {
        return await databases.updateDocument(DATABASE_ID, TABLES.TICKETS, id, {
          status,
        });
      } catch (error) {
        console.error("Update ticket status error:", error);
        throw error;
      }
    },
    async reply(
      ticketId: string,
      message: string,
      senderId: string,
      senderName: string, // Added
      isAdmin = true,
    ) {
      try {
        return await databases.createDocument(
          DATABASE_ID,
          TABLES.MESSAGES,
          ID.unique(),
          {
            ticketId,
            message,
            senderId,
            senderName, // Added
            isAdmin,
            createdAt: new Date().toISOString(),
          },
        );
      } catch (error) {
        console.error("Reply ticket error:", error);
        throw error;
      }
    },
  },
};
