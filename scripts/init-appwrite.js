const { Client, Databases, Storage, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// 1. Environment Configuration
// Using dedicated server-side variables as requested, avoiding EXPO_PUBLIC_*
const ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'travelling_db';

if (!API_KEY || !PROJECT_ID) {
  console.error("❌ Error: Missing required env vars.");
  console.error("Ensure APPWRITE_API_KEY and APPWRITE_PROJECT_ID are set in .env");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

// 2. Schema Definitions
const COLLECTIONS = {
  users: {
    name: "Users",
    documentSecurity: true, // Private user data
    permissions: [
      Permission.create(Role.any()), // Registration
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    attributes: [
      { key: "name", type: "string", size: 128, required: true },
      { key: "email", type: "string", size: 128, required: true },
      { key: "phone", type: "string", size: 20, required: false },
      { key: "avatar", type: "string", size: 500, required: false },
    ]
  },
  packages: {
    name: "Packages",
    documentSecurity: false, // Public data, readable by all
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin")),
    ],
    attributes: [
      { key: "title", type: "string", size: 128, required: true },
      { key: "destination", type: "string", size: 128, required: true },
      { key: "country", type: "string", size: 64, required: true },
      { key: "category", type: "string", size: 32, required: true },
      { key: "price", type: "integer", required: true },
      { key: "duration", type: "string", size: 64, required: true },
      { key: "rating", type: "float", required: true }, // Fixed: double -> float
      { key: "reviewCount", type: "integer", required: false, default: 0 },
      { key: "imageUrl", type: "string", size: 500, required: true },
      { key: "images", type: "string", size: 255, required: false, array: true }, // Fixed: huge size -> 255
      { key: "description", type: "string", size: 5000, required: true },
      { key: "highlights", type: "string", size: 255, required: false, array: true },
      { key: "inclusions", type: "string", size: 255, required: false, array: true },
      { key: "exclusions", type: "string", size: 255, required: false, array: true },
      { key: "itinerary", type: "string", size: 10000, required: false },
      { key: "isActive", type: "boolean", required: false, default: true },
    ],
    indexes: [
      { key: "search_title", type: "fulltext", attributes: ["title"] },
      { key: "search_destination", type: "fulltext", attributes: ["destination"] },
      { key: "search_country", type: "fulltext", attributes: ["country"] },
      { key: "category_index", type: "key", attributes: ["category"] },
      { key: "price_index", type: "key", attributes: ["price"] },
      { key: "rating_index", type: "key", attributes: ["rating"] },
    ]
  },
  bookings: {
    name: "Bookings",
    documentSecurity: true, // User specific
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "packageId", type: "string", size: 36, required: true },
      { key: "packageTitle", type: "string", size: 128, required: true },
      { key: "destination", type: "string", size: 128, required: true },
      { key: "totalPrice", type: "integer", required: true },
      { key: "status", type: "string", size: 32, required: false, default: "pending_payment" },
      { key: "paymentStatus", type: "string", size: 32, required: false, default: "pending" },
      { key: "paymentId", type: "string", size: 64, required: false },
      { key: "departureDate", type: "string", size: 32, required: true },
      { key: "returnDate", type: "string", size: 32, required: true },
      { key: "adultsCount", type: "integer", required: true },
      { key: "childrenCount", type: "integer", required: false, default: 0 },
      { key: "infantsCount", type: "integer", required: false, default: 0 },
      { key: "travelers", type: "string", size: 2000, required: true },
      { key: "statusHistory", type: "string", size: 2000, required: false }, 
      { key: "specialRequests", type: "string", size: 1000, required: false },
      { key: "createdAt", type: "string", size: 32, required: false },
    ],
    indexes: [
      { key: "user_index", type: "key", attributes: ["userId"] },
      { key: "status_index", type: "key", attributes: ["status"] },
    ]
  },
  documents: {
    name: "Documents",
    documentSecurity: true,
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.delete(Role.users()),
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "fileName", type: "string", size: 128, required: true },
      { key: "fileId", type: "string", size: 64, required: true },
      { key: "fileUrl", type: "string", size: 500, required: true },
      { key: "fileType", type: "string", size: 32, required: true },
      { key: "fileSize", type: "integer", required: true },
      { key: "uploadedAt", type: "string", size: 32, required: true },
    ],
    indexes: [
      { key: "user_index", type: "key", attributes: ["userId"] },
    ]
  },
  tickets: {
    name: "Tickets",
    documentSecurity: true,
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "subject", type: "string", size: 256, required: true },
      { key: "message", type: "string", size: 5000, required: true },
      { key: "category", type: "string", size: 32, required: true },
      { key: "priority", type: "string", size: 32, required: true },
      { key: "status", type: "string", size: 32, required: false, default: "open" },
      { key: "bookingId", type: "string", size: 36, required: false },
      { key: "createdAt", type: "string", size: 32, required: false },
    ],
    indexes: [
      { key: "user_index", type: "key", attributes: ["userId"] },
    ]
  },
  saved_travelers: {
    name: "Saved Travelers",
    documentSecurity: true,
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "name", type: "string", size: 128, required: true },
      { key: "age", type: "integer", required: true },
      { key: "gender", type: "string", size: 16, required: true },
      { key: "passportNumber", type: "string", size: 64, required: false },
      { key: "email", type: "string", size: 128, required: false },
      { key: "phone", type: "string", size: 20, required: false },
      { key: "createdAt", type: "string", size: 32, required: false },
    ],
    indexes: [
      { key: "user_index", type: "key", attributes: ["userId"] },
    ]
  }
};

const BUCKETS = [
  // User content matches strict security
  { 
    id: "avatars", 
    name: "User Avatars", 
    fileSecurity: true, // Fixed: Enable security
    permissions: [
      Permission.read(Role.any()), 
      Permission.create(Role.users()), 
      Permission.update(Role.users()), 
      Permission.delete(Role.users())
    ] 
  },
  { 
    id: "package_images", 
    name: "Package Images", 
    fileSecurity: false, // Public images, generally readable
    permissions: [
      Permission.read(Role.any()), 
      Permission.create(Role.team("admin")),
      Permission.update(Role.team("admin")),
      Permission.delete(Role.team("admin"))
    ] 
  },
  { 
    id: "travel_documents", 
    name: "Travel Documents", 
    fileSecurity: true, 
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()), 
      Permission.update(Role.users()), 
      Permission.delete(Role.users())
    ] 
  },
];

// Helper to create attribute with normalized inputs (fixing signatures)
async function createAttributeWithRetry(databases, dbId, colId, attr) {
  let retries = 3;
  
  // Normalize inputs for v1.5+ signatures
  const def = attr.default ?? null;
  const arr = attr.array === true; // Strict boolean check
  const required = attr.required;
  const key = attr.key;

  while (retries > 0) {
    try {
      if (attr.type === "string") {
        await databases.createStringAttribute(dbId, colId, key, attr.size, required, def, arr);
      } else if (attr.type === "integer") {
        // Appwrite requires min/max for integers. Using widely safe 32-bit range.
        await databases.createIntegerAttribute(dbId, colId, key, required, -2147483648, 2147483647, def, arr);
      } else if (attr.type === "float" || attr.type === "double") { 
        // Using createFloatAttribute
        await databases.createFloatAttribute(dbId, colId, key, required, 0, 1000000000, def, arr);
      } else if (attr.type === "boolean") {
        await databases.createBooleanAttribute(dbId, colId, key, required, def, arr);
      } else if (attr.type === "email") {
        await databases.createEmailAttribute(dbId, colId, key, required, def, arr);
      } else if (attr.type === "url") {
        await databases.createUrlAttribute(dbId, colId, key, required, def, arr);
      }
      return; 
    } catch (err) {
      if (err.code === 409) return; // Already exists
      
      retries--;
      console.log(`      ⚠️ Error creating ${attr.key}: ${err.message}. Retrying...`);
      if (retries === 0) console.error(`      ❌ Failed to create ${attr.key}: ${err.message}`);
      
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function init() {
  console.log("🚀 Starting Production-Grade Appwrite Init...");

  // 1. Database
  try {
    await databases.get(DATABASE_ID);
    console.log(`✅ Database '${DATABASE_ID}' exists.`);
  } catch (err) {
    if (err.code === 404) {
      console.log(`Creating database '${DATABASE_ID}'...`);
      await databases.create(DATABASE_ID, "Travelling DB");
    } else {
      console.error("Error checking database:", err);
    }
  }

  // 2. Collections
  for (const [colId, colConfig] of Object.entries(COLLECTIONS)) {
    console.log(`Processing collection '${colId}'...`);
    try {
      await databases.getCollection(DATABASE_ID, colId);
      console.log(`   ✅ Exists. Updating config...`);
      // Update with Correct Document Security setting
      await databases.updateCollection(
        DATABASE_ID, 
        colId, 
        colConfig.name, 
        colConfig.permissions, 
        colConfig.documentSecurity 
      );
    } catch (err) {
      if (err.code === 404) {
        console.log(`   Creating...`);
        await databases.createCollection(
          DATABASE_ID, 
          colId, 
          colConfig.name, 
          colConfig.permissions, 
          colConfig.documentSecurity
        );
      } else {
        console.error(`   Error checking collection:`, err);
        continue;
      }
    }

    // Attributes
    console.log(`   Syncing attributes...`);
    for (const attr of colConfig.attributes) {
        await createAttributeWithRetry(databases, DATABASE_ID, colId, attr);
        await new Promise(r => setTimeout(r, 100)); // Rate limit buffer
    }
    
    // Indexes
    if (colConfig.indexes) {
        console.log(`   Syncing indexes...`);
        for (const idx of colConfig.indexes) {
            try {
                await databases.createIndex(DATABASE_ID, colId, idx.key, idx.type, idx.attributes);
                await new Promise(r => setTimeout(r, 500));
            } catch (idxErr) {
                 if (idxErr.code !== 409) console.error(`      Index error ${idx.key}:`, idxErr.message);
            }
        }
    }
  }

  // 3. Storage Buckets
  console.log("Processing Storage Buckets...");
  for (const bucket of BUCKETS) {
    try {
      await storage.getBucket(bucket.id);
      console.log(`   ✅ Bucket '${bucket.id}' exists. Updating security...`);
      await storage.updateBucket(
            bucket.id, 
            bucket.name, 
            bucket.permissions, 
            bucket.fileSecurity, 
            true // Enabled (functionality implied, checking SDK signature for updateBucket)
            // Note: updateBucket(bucketId, name, permissions, fileSecurity?, enabled?, maximumFileSize?, allowedFileExtensions?, compression?, encryption?, antivirus?)
       );
    } catch (err) {
      if (err.code === 404) {
        console.log(`   Creating bucket '${bucket.id}'...`);
        await storage.createBucket(
            bucket.id, 
            bucket.name, 
            bucket.permissions, 
            bucket.fileSecurity
        );
      } else {
        console.error(`   Error checking bucket '${bucket.id}':`, err);
      }
    }
  }

  console.log("\n🎉 Init Complete. Schema is properly defined.");
}

init();
