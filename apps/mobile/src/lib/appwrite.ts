import {
  Account,
  Client,
  Databases,
  Functions,
  ID,
  OAuthProvider,
  Query,
  Storage,
  TablesDB,
} from "react-native-appwrite";
import "react-native-url-polyfill/auto";

// Appwrite Configuration from environment variables
const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "";
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "";
const platform =
  process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || "com.travels.travelling";

// Export constants for use in other services
export const APPWRITE_ENDPOINT = endpoint;
export const APPWRITE_PROJECT_ID = projectId;

// Database and Table IDs
export const DATABASE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "travelling_db";

export const TABLES = {
  USERS: "users",
  PACKAGES: "packages",
  BOOKINGS: "bookings",
  DOCUMENTS: "documents",
  TICKETS: "tickets",
  SAVED_TRAVELERS: "saved_travelers",
  REVIEWS: "reviews",
  PAYMENTS: "payments",
  MESSAGES: "ticket_messages",
  CHAT_MESSAGES: "messages",
  ADDONS: "addons",
  BANNERS: "banners",
  CONSULTATIONS: "consultations",
  NOTIFICATIONS: "notifications",
};

export const BUCKETS = {
  TRAVEL_DOCUMENTS: "travel_documents",
  PACKAGE_IMAGES: "package_images",
  AVATARS: "avatars",
  CONSULTATION_ATTACHMENTS: "consultation_attachments",
};

// Function IDs (must be configured in environment)
export const FUNCTIONS = {
  CREATE_PAYMENT_INTENT:
    process.env.EXPO_PUBLIC_APPWRITE_FUNCTION_ID_PAYMENT || "",
};

// Initialize Client
const client = new Client();

// Only set up client if configuration exists
if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);

  if (platform) {
    client.setPlatform(platform);
  }
}

// Initialize services
export const account = new Account(client);
export const storage = new Storage(client);
export const databases = new Databases(client);
export const functions = new Functions(client);
export const tables = new TablesDB(client); // Re-added

// Check if Appwrite is configured
export const isAppwriteConfigured = (): boolean => {
  return !!(endpoint && projectId);
};

// ============ Query Builder ============

// Export utilities
export { client, ID, OAuthProvider, Query };
