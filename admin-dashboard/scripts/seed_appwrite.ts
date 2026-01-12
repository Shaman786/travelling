import dotenv from "dotenv";
import {
  Client,
  Databases,
  ID,
  Permission,
  Role,
  Storage,
  Teams,
  Users,
} from "node-appwrite";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// 1. Environment Configuration
const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY =
  process.env.APPWRITE_API_KEY || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
const DATABASE_ID = "travelling_db"; // Hardcoded as per project constants

if (!API_KEY || !PROJECT_ID) {
  console.error("❌ Error: Missing required env vars.");
  console.error(
    "Ensure APPWRITE_API_KEY and NEXT_PUBLIC_APPWRITE_PROJECT_ID are set in .env.local",
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);
const users = new Users(client);
const teams = new Teams(client);

// Admin Config
const ADMIN_EMAIL = "admin@travelling.app";
const ADMIN_PASS = "password123"; // Initial password
const ADMIN_NAME = "Super Admin";
const TEAM_NAME = "admin";

// 2. Schema Definitions
const COLLECTIONS: any = {
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
      { key: "pushToken", type: "string", size: 255, required: false },
      // Onboarding fields
      {
        key: "onboardingComplete",
        type: "boolean",
        required: false,
        default: false,
      },
      { key: "travelStyle", type: "string", size: 64, required: false }, // adventure, relaxation, cultural, family
      { key: "budgetRange", type: "string", size: 32, required: false }, // budget, midrange, luxury
      {
        key: "preferredDestinations",
        type: "string",
        size: 255,
        required: false,
        array: true,
      },
      // Role for Admin Dashboard access
      {
        key: "role",
        type: "string",
        size: 32,
        required: false,
        default: "user",
      },
    ],
  },
  packages: {
    name: "Packages",
    documentSecurity: false, // Public data
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.team("695f5c530000d10e3388")),
      Permission.update(Role.team("695f5c530000d10e3388")),
      Permission.delete(Role.team("695f5c530000d10e3388")),
    ],
    attributes: [
      { key: "title", type: "string", size: 128, required: true },
      { key: "destination", type: "string", size: 128, required: true },
      { key: "country", type: "string", size: 64, required: true },
      { key: "category", type: "string", size: 64, required: true },
      { key: "price", type: "double", required: true },
      { key: "duration", type: "string", size: 64, required: true },
      { key: "rating", type: "double", required: false, default: 0 },
      { key: "reviewCount", type: "integer", required: false, default: 0 },
      { key: "description", type: "string", size: 3000, required: false },

      // Media
      { key: "imageUrl", type: "string", size: 1024, required: false },
      {
        key: "images",
        type: "string",
        size: 1024,
        required: false,
        array: true,
      },

      // Arrays of strings
      {
        key: "highlights",
        type: "string",
        size: 255,
        required: false,
        array: true,
      },
      {
        key: "inclusions",
        type: "string",
        size: 255,
        required: false,
        array: true,
      },
      {
        key: "exclusions",
        type: "string",
        size: 255,
        required: false,
        array: true,
      },

      // Complex Data
      { key: "itinerary", type: "string", size: 10000, required: false }, // JSON String with images

      // Status
      { key: "isActive", type: "boolean", required: false, default: true },
    ],
    indexes: [
      { key: "search_title", type: "fulltext", attributes: ["title"] },
      {
        key: "search_destination",
        type: "fulltext",
        attributes: ["destination"],
      },
    ],
  },
  bookings: {
    name: "Bookings",
    documentSecurity: true, // User specific
    permissions: [
      Permission.create(Role.users()), // Authenticated users can create
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
      // Note: Owner permissions (Role.user(id)) are implicit with documentSecurity: true
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "packageId", type: "string", size: 36, required: true },
      { key: "packageName", type: "string", size: 128, required: true },
      { key: "totalPrice", type: "double", required: true },
      {
        key: "status",
        type: "string",
        size: 32,
        required: false,
        default: "pending",
      },
      { key: "travelers", type: "string", size: 5000, required: false }, // JSON string
    ],
    indexes: [{ key: "user_index", type: "key", attributes: ["userId"] }],
  },
  reviews: {
    name: "Reviews",
    documentSecurity: true,
    permissions: [
      Permission.read(Role.any()), // Public can read approved reviews (filtered by query)
      Permission.create(Role.users()), // Users can write
      Permission.update(Role.team("695f5c530000d10e3388")), // Only admin can update status
      Permission.delete(Role.team("695f5c530000d10e3388")),
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "packageId", type: "string", size: 36, required: true },
      { key: "rating", type: "integer", required: true, min: 1, max: 5 },
      { key: "comment", type: "string", size: 1000, required: false },
      {
        key: "status",
        type: "string",
        size: 32,
        required: false,
        default: "pending",
      },
    ],
    indexes: [
      { key: "package_index", type: "key", attributes: ["packageId"] },
      { key: "status_index", type: "key", attributes: ["status"] },
    ],
  },
  // Add other collections similarly if needed
};

const BUCKETS = [
  {
    id: "package_images",
    name: "Package Images",
    fileSecurity: false,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.create(Role.team("695f5c530000d10e3388")), // Admin team
      Permission.update(Role.team("695f5c530000d10e3388")),
      Permission.delete(Role.team("695f5c530000d10e3388")),
    ],
  },
  {
    id: "avatars",
    name: "Avatars",
    fileSecurity: true,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
  },
];

async function createAttributeWithRetry(
  dbId: string,
  colId: string,
  attr: any,
) {
  try {
    if (attr.type === "string") {
      await databases.createStringAttribute(
        dbId,
        colId,
        attr.key,
        attr.size,
        attr.required,
        attr.default,
        attr.array,
      );
    } else if (attr.type === "integer") {
      await databases.createIntegerAttribute(
        dbId,
        colId,
        attr.key,
        attr.required,
        -2147483648,
        2147483647,
        attr.default,
        attr.array,
      );
    } else if (attr.type === "double" || attr.type === "float") {
      await databases.createFloatAttribute(
        dbId,
        colId,
        attr.key,
        attr.required,
        0,
        1000000000,
        attr.default,
        attr.array,
      );
    } else if (attr.type === "boolean") {
      await databases.createBooleanAttribute(
        dbId,
        colId,
        attr.key,
        attr.required,
        attr.default,
        attr.array,
      );
    }
    await new Promise((r) => setTimeout(r, 500)); // Buffer
  } catch (err: any) {
    if (err.code === 409) return; // Already exists
    console.log(`      ⚠️ Error creating ${attr.key}: ${err.message}`);
  }
}

async function setupAdmin() {
  console.log("🚀 Setting up Admin User & Team...");

  let teamId = null;

  // 1. Create or Get 'admin' Team
  try {
    const teamList = await teams.list();
    const existingTeam = teamList.teams.find((t) => t.name === TEAM_NAME);

    if (existingTeam) {
      console.log(
        `✅ Team '${TEAM_NAME}' already exists (ID: ${existingTeam.$id})`,
      );
      teamId = existingTeam.$id;
    } else {
      console.log(`Creating team '${TEAM_NAME}'...`);
      const newTeam = await teams.create(ID.unique(), TEAM_NAME);
      teamId = newTeam.$id;
      console.log(`✅ Team created (ID: ${teamId})`);
    }
  } catch (err: any) {
    console.error("Error managing team:", err.message);
  }

  // 2. Create or Get Admin User
  let userId = null;
  try {
    const userList = await users.list([
      // Query logic could go here, but simple listing is fine for now
    ]);
    const existingUser = userList.users.find((u) => u.email === ADMIN_EMAIL);

    if (existingUser) {
      console.log(
        `✅ User '${ADMIN_EMAIL}' already exists (ID: ${existingUser.$id})`,
      );
      userId = existingUser.$id;
      // Force update password to ensure it's known
      console.log(`Resetting password to '${ADMIN_PASS}'...`);
      await users.updatePassword(userId, ADMIN_PASS);
      console.log(`✅ Password updated.`);
    } else {
      console.log(`Creating user '${ADMIN_EMAIL}'...`);
      const newUser = await users.create(
        ID.unique(),
        ADMIN_EMAIL,
        undefined,
        ADMIN_PASS,
        ADMIN_NAME,
      );
      userId = newUser.$id;
      console.log(`✅ User created successfully.`);
    }
  } catch (err: any) {
    console.error("Error managing user:", err.message);
  }

  // 3. Add User to Team
  if (teamId && userId) {
    try {
      const memberships = await teams.listMemberships(teamId);
      const isMember = memberships.memberships.find((m) => m.userId === userId);

      if (isMember) {
        console.log(`✅ User is already a member of the '${TEAM_NAME}' team.`);
      } else {
        console.log(`Adding user to '${TEAM_NAME}' team...`);
        await teams.createMembership(teamId, ["owner"], undefined, userId);
        console.log(`✅ User added to team '${TEAM_NAME}'.`);
      }
    } catch (err: any) {
      if (err.code === 409) {
        console.log(`✅ User is already a member.`);
      } else {
        console.error("Error adding to team:", err.message);
      }
    }

    // 4. Create/Update Admin User Document in Database
    try {
      // Check if document exists
      try {
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          "users",
          userId,
        );
        console.log(`✅ Admin User Document exists. Updating role...`);
        await databases.updateDocument(DATABASE_ID, "users", userId, {
          role: "admin",
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
        });
      } catch (e: any) {
        if (e.code === 404) {
          console.log(`Creating Admin User Document...`);
          await databases.createDocument(DATABASE_ID, "users", userId, {
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            role: "admin",
            createdAt: new Date().toISOString(),
          });
          console.log(`✅ Admin User Document created.`);
        } else {
          throw e; // Other error
        }
      }
    } catch (err: any) {
      console.error("Error managing Admin User Document:", err.message);
    }
  }
}

async function init() {
  console.log("🚀 Starting Appwrite Recovery...");

  await setupAdmin();

  // 1. Database
  try {
    await databases.get(DATABASE_ID);
    console.log(`✅ Database '${DATABASE_ID}' exists.`);
  } catch (err: any) {
    if (err.code === 404) {
      console.log(`Creating database '${DATABASE_ID}'...`);
      await databases.create(DATABASE_ID, "Travelling DB");
    } else {
      console.error("Error checking database:", err);
    }
  }

  // 2. Collections
  for (const [colId, colConfig] of Object.entries(COLLECTIONS) as [
    string,
    any,
  ][]) {
    console.log(`Processing collection '${colId}'...`);
    try {
      await databases.getCollection(DATABASE_ID, colId);
      console.log(`   ✅ Exists. Updating permissions...`);
      await databases.updateCollection(
        DATABASE_ID,
        colId,
        colConfig.name,
        colConfig.permissions,
        colConfig.documentSecurity,
      );

      // Clean up legacy attributes if they exist
      if (colId === "packages") {
        // Must delete index first
        try {
          console.log("   🧹 Checking for legacy 'search_name' index...");
          await databases.deleteIndex(DATABASE_ID, colId, "search_name");
          console.log("   🗑️ Deleted legacy 'search_name' index.");
        } catch (e) {
          // Ignore
        }

        try {
          console.log("   🧹 Checking for legacy 'name' attribute...");
          await databases.deleteAttribute(DATABASE_ID, colId, "name");
          console.log("   🗑️ Deleted legacy 'name' attribute.");
        } catch (e) {
          // Ignore if not found
        }
        try {
          console.log("   🧹 Checking for legacy 'location' attribute...");
          await databases.deleteAttribute(DATABASE_ID, colId, "location");
          console.log("   🗑️ Deleted legacy 'location' attribute.");
        } catch (e) {
          // Ignore
        }
      }
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`   Creating...`);
        await databases.createCollection(
          DATABASE_ID,
          colId,
          colConfig.name,
          colConfig.permissions,
          colConfig.documentSecurity,
        );
      }
    }

    // Attributes
    console.log(`   Syncing attributes...`);
    for (const attr of colConfig.attributes) {
      await createAttributeWithRetry(DATABASE_ID, colId, attr);
    }

    // Indexes
    if (colConfig.indexes) {
      // Simple index creation loop, errors ignored if exists
      for (const idx of colConfig.indexes) {
        try {
          await databases.createIndex(
            DATABASE_ID,
            colId,
            idx.key,
            idx.type,
            idx.attributes,
          );
        } catch (e: any) {
          if (e.code !== 409) console.log(`      Index error: ${e.message}`);
        }
      }
    }
  }

  // 3. Storage Buckets
  console.log("Processing Storage Buckets...");
  for (const bucket of BUCKETS) {
    try {
      await storage.getBucket(bucket.id);
      console.log(
        `   ✅ Bucket '${bucket.id}' exists. Updating permissions...`,
      );
      await storage.updateBucket(
        bucket.id,
        bucket.name,
        bucket.permissions,
        bucket.fileSecurity,
      );
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`   Creating bucket '${bucket.id}'...`);
        await storage.createBucket(
          bucket.id,
          bucket.name,
          bucket.permissions,
          bucket.fileSecurity,
        );
      }
    }
  }

  // 4. Ensure Admin Document Exists (After Schema Sync)
  console.log("Ensuring Admin Document in 'Users' collection...");
  try {
    // We need the admin user ID. We can fetch it again or assume we know it.
    // Ideally setupAdmin returns it, but let's just fetch by email quickly.
    const userList = await users.list([
      // Query not easily available in node-appwrite without Query object import?
      // Actually list() returns recent users.
    ]);
    const adminUser = userList.users.find((u) => u.email === ADMIN_EMAIL);
    if (adminUser) {
      try {
        await databases.updateDocument(DATABASE_ID, "users", adminUser.$id, {
          role: "admin",
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
        });
        console.log("✅ Admin Document Updated with Role.");
      } catch (e: any) {
        if (e.code === 404) {
          await databases.createDocument(DATABASE_ID, "users", adminUser.$id, {
            role: "admin",
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            createdAt: new Date().toISOString(),
          });
          console.log("✅ Admin Document Created.");
        } else {
          console.log("Error updating admin doc:", e.message);
        }
      }
    }
  } catch (err: any) {
    console.error("Error finalizing admin doc:", err.message);
  }

  console.log("\n🎉 Recovery Complete!");
}

init();
