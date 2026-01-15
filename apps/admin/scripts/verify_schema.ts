import dotenv from "dotenv";
import { Client, Databases, Storage, TablesDB } from "node-appwrite";
import path from "path";

// Load environment variables
console.log("CWD:", process.cwd());
const localEnvPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");
console.log("Loading .env.local from:", localEnvPath);
console.log("Loading .env from:", envPath);

dotenv.config({ path: localEnvPath });
dotenv.config({ path: envPath }); // Fallback to .env

// Config
const ENDPOINT =
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  "https://cloud.appwrite.io/v1";
const PROJECT_ID = (
  process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
  ""
).trim();
const API_KEY = (
  process.env.APPWRITE_API_KEY ||
  process.env.NEXT_PUBLIC_APPWRITE_API_KEY ||
  ""
).trim();
const DATABASE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "travelling_db";

if (!API_KEY || !PROJECT_ID) {
  console.error("❌ Error: Missing required env vars.");
  console.error(`   API_KEY: ${API_KEY ? "Set" : "MISSING"}`);
  console.error(`   PROJECT_ID: ${PROJECT_ID ? "Set" : "MISSING"}`);
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client); // Standard API for checking DB existence
const tableService = new TablesDB(client); // Modern TablesDB API for attributes
const storage = new Storage(client);

// ============================================
// COPY OF SCHEMA FROM init_db.ts
// ============================================
// Start of Schema Copy
const COLLECTIONS: any = {
  users: {
    name: "Users",
    attributes: [
      { key: "name", type: "string" },
      { key: "email", type: "string" },
      { key: "phone", type: "string" },
      { key: "avatar", type: "string" },
      { key: "pushToken", type: "string" },
      { key: "onboardingComplete", type: "boolean" },
      { key: "travelStyle", type: "string" },
      { key: "budgetRange", type: "string" },
      { key: "preferredDestinations", type: "string" },
      { key: "role", type: "string" },
    ],
  },
  admins: {
    name: "Admins",
    attributes: [
      { key: "userId", type: "string" },
      { key: "name", type: "string" },
      { key: "email", type: "string" },
      { key: "role", type: "string" },
      { key: "isActive", type: "boolean" },
    ],
  },
  packages: {
    name: "Packages",
    attributes: [
      { key: "title", type: "string" },
      { key: "destination", type: "string" },
      { key: "country", type: "string" },
      { key: "category", type: "string" },
      { key: "price", type: "double" },
      { key: "discountPrice", type: "double" },
      { key: "duration", type: "string" },
      { key: "rating", type: "double" },
      { key: "reviewCount", type: "integer" },
      { key: "description", type: "string" },
      { key: "imageUrl", type: "string" },
      { key: "images", type: "string" },
      { key: "highlights", type: "string" },
      { key: "inclusions", type: "string" },
      { key: "exclusions", type: "string" },
      { key: "itinerary", type: "string" },
      { key: "isActive", type: "boolean" },
      { key: "latitude", type: "double" },
      { key: "longitude", type: "double" },
    ],
  },
  bookings: {
    name: "Bookings",
    attributes: [
      { key: "userId", type: "string" },
      { key: "packageId", type: "string" },
      { key: "packageName", type: "string" },
      { key: "contactName", type: "string" },
      { key: "travelDate", type: "string" },
      { key: "totalPrice", type: "double" },
      { key: "status", type: "string" },
      { key: "travelers", type: "string" },
      { key: "paymentStatus", type: "string" },
      { key: "paymentId", type: "string" },
      { key: "statusHistory", type: "string" },
      { key: "specialRequests", type: "string" },
      { key: "isWorkTrip", type: "boolean" },
      { key: "companyName", type: "string" },
      { key: "taxId", type: "string" },
    ],
  },
  reviews: {
    name: "Reviews",
    attributes: [
      { key: "userId", type: "string" },
      { key: "userName", type: "string" },
      { key: "userAvatar", type: "string" },
      { key: "packageId", type: "string" },
      { key: "rating", type: "integer" },
      { key: "comment", type: "string" },
      { key: "status", type: "string" },
    ],
  },
  payments: {
    name: "Payments",
    attributes: [
      { key: "bookingId", type: "string" },
      { key: "userId", type: "string" },
      { key: "amount", type: "double" },
      { key: "currency", type: "string" },
      { key: "status", type: "string" },
      { key: "method", type: "string" },
      { key: "gatewayProvider", type: "string" },
      { key: "gatewayOrderId", type: "string" },
      { key: "gatewayPaymentId", type: "string" },
      { key: "refundId", type: "string" },
      { key: "refundAmount", type: "double" },
      { key: "refundReason", type: "string" },
    ],
  },
  addons: {
    name: "Addons",
    attributes: [
      { key: "name", type: "string" },
      { key: "description", type: "string" },
      { key: "price", type: "double" },
      { key: "type", type: "string" },
      { key: "icon", type: "string" },
      { key: "isActive", type: "boolean" },
    ],
  },
  tickets: {
    name: "Support Tickets",
    attributes: [
      { key: "userId", type: "string" },
      { key: "subject", type: "string" },
      { key: "message", type: "string" },
      { key: "category", type: "string" },
      { key: "status", type: "string" },
      { key: "priority", type: "string" },
    ],
  },
  ticket_messages: {
    name: "Ticket Messages",
    attributes: [
      { key: "ticketId", type: "string" },
      { key: "message", type: "string" },
      { key: "senderId", type: "string" },
      { key: "senderName", type: "string" },
      { key: "isAdmin", type: "boolean" },
      { key: "createdAt", type: "string" },
      { key: "senderType", type: "string" },
      { key: "attachmentId", type: "string" },
    ],
  },
  saved_travelers: {
    name: "Saved Travelers",
    attributes: [
      { key: "userId", type: "string" },
      { key: "name", type: "string" },
      { key: "age", type: "integer" },
      { key: "gender", type: "string" },
      { key: "passportNumber", type: "string" },
      { key: "email", type: "string" },
      { key: "phone", type: "string" },
    ],
  },
  system_config: {
    name: "System Config",
    attributes: [
      { key: "key", type: "string" },
      { key: "value", type: "string" },
      { key: "description", type: "string" },
    ],
  },
  banners: {
    name: "Banners",
    attributes: [
      { key: "title", type: "string" },
      { key: "subtitle", type: "string" },
      { key: "imageUrl", type: "string" },
      { key: "ctaText", type: "string" },
      { key: "ctaLink", type: "string" },
      { key: "sortOrder", type: "integer" },
      { key: "isActive", type: "boolean" },
    ],
  },
  consultations: {
    name: "Consultations",
    attributes: [
      { key: "userId", type: "string" },
      { key: "userName", type: "string" },
      { key: "userPhone", type: "string" },
      { key: "userEmail", type: "string" },
      { key: "type", type: "string" },
      { key: "destination", type: "string" },
      { key: "dates", type: "string" },
      { key: "travelers", type: "string" },
      { key: "budget", type: "string" },
      { key: "notes", type: "string" },
      { key: "status", type: "string" },
      { key: "attachmentId", type: "string" },
      { key: "attachmentName", type: "string" },
    ],
  },
  documents: {
    name: "Documents",
    attributes: [
      { key: "userId", type: "string" },
      { key: "fileName", type: "string" },
      { key: "fileId", type: "string" },
      { key: "fileUrl", type: "string" },
      { key: "fileType", type: "string" },
      { key: "fileSize", type: "integer" },
      { key: "uploadedAt", type: "string" },
    ],
  },
};

const BUCKETS = [
  { id: "package_images", name: "Package Images" },
  { id: "avatars", name: "Avatars" },
  { id: "consultation_attachments", name: "Consultation Attachments" },
  { id: "travel_documents", name: "Travel Documents" },
];
// End of Schema Copy
// ============================================

async function verify() {
  console.log(`\n🔍 Verifying Database Schema against '${DATABASE_ID}'...`);
  let errors = 0;

  // 1. Verify Database Exists
  try {
    await databases.get(DATABASE_ID);
    console.log(`✅ Database '${DATABASE_ID}' exists.`);
  } catch (err: any) {
    console.error(
      `❌ Database '${DATABASE_ID}' NOT FOUND. (Code: ${err.code})`,
    );
    return;
  }

  // 2. Verify Tables and Columns
  for (const [colId, colConfig] of Object.entries(COLLECTIONS) as [
    string,
    any,
  ][]) {
    try {
      // Check if table exists
      await tableService.getTable(DATABASE_ID, colId);
      process.stdout.write(`   Table '${colId}' (` + colConfig.name + `): `);

      // Fetch actual columns
      const { columns } = await tableService.listColumns(DATABASE_ID, colId);
      const actualKeys = new Set(columns.map((c: any) => c.key));

      let missingAttrs = [];
      for (const expectedAttr of colConfig.attributes) {
        if (!actualKeys.has(expectedAttr.key)) {
          missingAttrs.push(expectedAttr.key);
        }
      }

      if (missingAttrs.length === 0) {
        console.log(`✅ Matches`);
      } else {
        console.log(`❌ MISSING COLUMNS: ${missingAttrs.join(", ")}`);
        errors++;
      }
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`❌ Table '${colId}' DOES NOT EXIST`);
        errors++;
      } else {
        console.error(`\n   ⚠️ Error checking '${colId}': ${err.message}`);
      }
    }
  }

  // 3. Verify Storage Buckets
  console.log(`\nChecking Storage Buckets...`);
  for (const bucket of BUCKETS) {
    try {
      await storage.getBucket(bucket.id);
      console.log(`   Bucket '${bucket.id}': ✅ Exists`);
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`   Bucket '${bucket.id}': ❌ MISSING`);
        errors++;
      } else {
        console.error(
          `   ⚠️ Error checking bucket '${bucket.id}': ${err.message}`,
        );
      }
    }
  }

  console.log(`\n================================`);
  if (errors === 0) {
    console.log(`🎉 Schema Verification PASSED. DB is in sync.`);
  } else {
    console.log(`⚠️ Schema Verification FAILED with ${errors} issues.`);
    console.log(
      `   Run 'npx ts-node admin-dashboard/scripts/init_db.ts' to fix.`,
    );
  }
}

verify();
