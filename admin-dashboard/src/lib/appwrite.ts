import { Account, Client, Databases, Storage } from "appwrite";

// Appwrite Configuration from environment variables
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";

// Export constants for use in other services
export const APPWRITE_ENDPOINT = endpoint;
export const APPWRITE_PROJECT_ID = projectId;

// Database ID
export const DATABASE_ID = "travelling_db";

export const TABLES = {
  USERS: "users",
  PACKAGES: "packages",
  BOOKINGS: "bookings",
  DOCUMENTS: "documents",
  TICKETS: "tickets",
  SAVED_TRAVELERS: "saved_travelers",
  REVIEWS: "reviews",
  PAYMENTS: "payments",
};

export const BUCKETS = {
  TRAVEL_DOCUMENTS: "travel_documents",
  PACKAGE_IMAGES: "package_images",
  AVATARS: "avatars",
};

// Initialize Client
const client = new Client();

// Only set up client if configuration exists
if (endpoint && projectId) {
  client.setEndpoint(endpoint).setProject(projectId);
}

// Initialize Account service (for auth)
export const account = new Account(client);
export const storage = new Storage(client);
export const databases = new Databases(client);

// Check if Appwrite is configured
export const isAppwriteConfigured = (): boolean => {
  return !!(endpoint && projectId);
};

export { ID } from "appwrite";
export { client };
