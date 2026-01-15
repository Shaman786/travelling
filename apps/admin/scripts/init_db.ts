import dotenv from "dotenv";
import {
  Client,
  Databases,
  ID,
  Permission,
  Query,
  Role,
  Storage,
  TablesDB,
  Teams,
  Users,
} from "node-appwrite";
import path from "path";

// Load environment variables from .env
// Load environment variables from .env or .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") }); // Fallback to .env

// 1. Environment Configuration
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
const tableService = new TablesDB(client);
const storage = new Storage(client);
const users = new Users(client);
const teams = new Teams(client);

// Admin Config
const ADMIN_EMAIL = "admin@travelling.app";
const ADMIN_PASS = "password123"; // Initial password
const ADMIN_NAME = "Super Admin";
const TEAM_NAME = "admin";
const ADMIN_TEAM_ID = "695f5c530000d10e3388"; // Optional hardcoded ID or dynamic

// 2. Schema Definitions (Full Superscript)
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
      {
        key: "onboardingComplete",
        type: "boolean",
        required: false,
        default: false,
      },
      { key: "travelStyle", type: "string", size: 64, required: false },
      { key: "budgetRange", type: "string", size: 32, required: false },
      {
        key: "preferredDestinations",
        type: "string",
        size: 255,
        required: false,
        array: true,
      },
      // Admin Role
      {
        key: "role",
        type: "string",
        size: 32,
        required: false,
        default: "user",
      },
    ],
    // Admin Role is no longer needed in users table if we have admins table, but we can keep it as legacy or for simple auth checks
  },
  admins: {
    name: "Admins",
    documentSecurity: true,
    permissions: [
      Permission.read(Role.team(TEAM_NAME)),
      Permission.write(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "name", type: "string", size: 128, required: true },
      { key: "email", type: "string", size: 128, required: true },
      { key: "role", type: "string", size: 32, required: true },
      { key: "isActive", type: "boolean", required: false, default: true },
    ],
    indexes: [
      { key: "email_idx", type: "unique", attributes: ["email"] },
      { key: "user_idx", type: "unique", attributes: ["userId"] },
    ],
  },
  packages: {
    name: "Packages",
    documentSecurity: false, // Public data
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.team(TEAM_NAME)), // Admin only (dynamic team check below)
      Permission.update(Role.team(TEAM_NAME)),
      Permission.delete(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "title", type: "string", size: 128, required: true },
      { key: "destination", type: "string", size: 128, required: true },
      { key: "country", type: "string", size: 64, required: true },
      { key: "category", type: "string", size: 64, required: true },
      { key: "price", type: "double", required: true },
      { key: "discountPrice", type: "double", required: false }, // Added
      { key: "duration", type: "string", size: 64, required: true },
      { key: "rating", type: "double", required: false, default: 0 },
      { key: "reviewCount", type: "integer", required: false, default: 0 },
      { key: "description", type: "string", size: 3000, required: false },
      { key: "imageUrl", type: "string", size: 1024, required: false },
      {
        key: "images",
        type: "string",
        size: 1024,
        required: false,
        array: true,
      },
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
      { key: "itinerary", type: "string", size: 5000, required: false }, // Reduced size
      { key: "isActive", type: "boolean", required: false, default: true },
      { key: "latitude", type: "double", required: false },
      { key: "longitude", type: "double", required: false },
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
    documentSecurity: true,
    permissions: [
      Permission.create(Role.users()), // Users can create
      Permission.read(Role.team(TEAM_NAME)), // Admins can read all
      Permission.update(Role.team(TEAM_NAME)), // Admins can update all
      Permission.delete(Role.team(TEAM_NAME)), // Admins can delete all
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "packageId", type: "string", size: 36, required: true },
      { key: "packageName", type: "string", size: 128, required: true },
      { key: "contactName", type: "string", size: 128, required: false }, // Added
      { key: "travelDate", type: "string", size: 64, required: false }, // Added
      { key: "totalPrice", type: "double", required: true },
      {
        key: "status",
        type: "string",
        size: 32,
        required: false,
        default: "pending",
      },
      { key: "travelers", type: "string", size: 5000, required: false },
      {
        key: "paymentStatus",
        type: "string",
        size: 32,
        required: false,
        default: "pending",
      },
      { key: "paymentId", type: "string", size: 128, required: false },
      { key: "statusHistory", type: "string", size: 5000, required: false },
      { key: "specialRequests", type: "string", size: 1000, required: false }, // Added
      // Business Trip attributes
      { key: "isWorkTrip", type: "boolean", required: false, default: false },
      { key: "companyName", type: "string", size: 128, required: false },
      { key: "taxId", type: "string", size: 64, required: false },
    ],
    indexes: [{ key: "user_index", type: "key", attributes: ["userId"] }],
  },
  reviews: {
    name: "Reviews",
    documentSecurity: true,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.team(TEAM_NAME)),
      Permission.delete(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "userName", type: "string", size: 128, required: false }, // Added
      { key: "userAvatar", type: "string", size: 1024, required: false }, // Added
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
  payments: {
    name: "Payments",
    documentSecurity: true,
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.team(TEAM_NAME)),
      Permission.delete(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "bookingId", type: "string", size: 36, required: true },
      { key: "userId", type: "string", size: 36, required: true },
      { key: "amount", type: "double", required: true },
      { key: "currency", type: "string", size: 3, required: true },
      { key: "status", type: "string", size: 32, required: true },
      { key: "method", type: "string", size: 32, required: false },
      { key: "gatewayProvider", type: "string", size: 32, required: false },
      { key: "gatewayOrderId", type: "string", size: 128, required: false },
      { key: "gatewayPaymentId", type: "string", size: 128, required: false },
      // Refund fields
      { key: "refundId", type: "string", size: 128, required: false },
      { key: "refundAmount", type: "double", required: false },
      { key: "refundReason", type: "string", size: 255, required: false },
    ],
    indexes: [
      { key: "booking_index", type: "key", attributes: ["bookingId"] },
      { key: "user_index", type: "key", attributes: ["userId"] },
      { key: "gateway_pid_idx", type: "key", attributes: ["gatewayPaymentId"] }, // Added
      { key: "gateway_oid_idx", type: "key", attributes: ["gatewayOrderId"] }, // Added
    ],
  },
  addons: {
    name: "Addons",
    documentSecurity: false,
    permissions: [
      Permission.read(Role.any()),
      Permission.write(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "name", type: "string", size: 128, required: true },
      { key: "description", type: "string", size: 1024, required: true },
      { key: "price", type: "double", required: true },
      { key: "type", type: "string", size: 32, required: true }, // per_person, per_booking
      { key: "icon", type: "string", size: 255, required: true },
      { key: "isActive", type: "boolean", required: true },
    ],
  },
  tickets: {
    name: "Support Tickets",
    documentSecurity: true,
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.team(TEAM_NAME)), // Users can't verify/close directly, only admin
      Permission.delete(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: true },
      { key: "subject", type: "string", size: 255, required: true },
      { key: "message", type: "string", size: 5000, required: true },
      { key: "category", type: "string", size: 64, required: true },
      {
        key: "status",
        type: "string",
        size: 32,
        required: false,
        default: "open",
      }, // Fixed required: false
      {
        key: "priority",
        type: "string",
        size: 32,
        required: false,
        default: "medium",
      }, // Fixed required: false
    ],
    indexes: [
      { key: "status_idx", type: "key", attributes: ["status"] },
      { key: "user_idx", type: "key", attributes: ["userId"] },
      { key: "subject_search", type: "fulltext", attributes: ["subject"] }, // Added
    ],
  },
  ticket_messages: {
    name: "Ticket Messages",
    documentSecurity: true,
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.read(Role.team(TEAM_NAME)),
      Permission.write(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "ticketId", type: "string", size: 36, required: true },
      { key: "message", type: "string", size: 5000, required: true },
      { key: "senderId", type: "string", size: 36, required: true },
      { key: "senderName", type: "string", size: 128, required: false }, // Added
      { key: "isAdmin", type: "boolean", required: true },
      { key: "createdAt", type: "string", size: 64, required: true },
      // Future Proofing
      { key: "senderType", type: "string", size: 32, required: false },
      { key: "attachmentId", type: "string", size: 128, required: false },
    ],
    indexes: [{ key: "ticket_idx", type: "key", attributes: ["ticketId"] }],
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
      { key: "gender", type: "string", size: 32, required: true },
      { key: "passportNumber", type: "string", size: 64, required: false },
      { key: "email", type: "string", size: 128, required: false },
      { key: "phone", type: "string", size: 32, required: false },
    ],
  },
  system_config: {
    name: "System Config",
    documentSecurity: false,
    permissions: [
      Permission.read(Role.any()),
      Permission.write(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "key", type: "string", size: 128, required: true },
      { key: "value", type: "string", size: 5000, required: true }, // Reduced size
      { key: "description", type: "string", size: 255, required: false },
    ],
    indexes: [{ key: "config_key", type: "unique", attributes: ["key"] }],
  },
  banners: {
    name: "Banners",
    documentSecurity: false,
    permissions: [
      Permission.read(Role.any()),
      Permission.write(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "title", type: "string", size: 128, required: true },
      { key: "subtitle", type: "string", size: 128, required: false },
      { key: "imageUrl", type: "string", size: 1024, required: true },
      { key: "ctaText", type: "string", size: 64, required: false },
      { key: "ctaLink", type: "string", size: 1024, required: false },
      { key: "sortOrder", type: "integer", required: true },
      { key: "isActive", type: "boolean", required: false, default: true },
    ],
    indexes: [{ key: "sort_order", type: "key", attributes: ["sortOrder"] }],
  },
  consultations: {
    name: "Consultations",
    documentSecurity: true,
    permissions: [
      Permission.create(Role.any()), // Allow unauthenticated (maybe) or users
      Permission.read(Role.users()),
      Permission.read(Role.team(TEAM_NAME)),
      Permission.write(Role.team(TEAM_NAME)),
    ],
    attributes: [
      { key: "userId", type: "string", size: 36, required: false },
      { key: "userName", type: "string", size: 128, required: true },
      { key: "userPhone", type: "string", size: 32, required: true },
      { key: "userEmail", type: "string", size: 128, required: false },
      { key: "type", type: "string", size: 32, required: true }, // plan_trip, expert, visa, etc.
      { key: "destination", type: "string", size: 128, required: false },
      { key: "dates", type: "string", size: 128, required: false },
      { key: "travelers", type: "string", size: 64, required: false },
      { key: "budget", type: "string", size: 64, required: false },
      { key: "notes", type: "string", size: 2000, required: false },
      {
        key: "status",
        type: "string",
        size: 32,
        required: false,
        default: "new", // new, contacted, closed
      },
      // File Attachment
      { key: "attachmentId", type: "string", size: 128, required: false },
      { key: "attachmentName", type: "string", size: 255, required: false },
    ],
    indexes: [
      { key: "type_idx", type: "key", attributes: ["type"] },
      { key: "status_idx", type: "key", attributes: ["status"] },
    ],
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
    indexes: [{ key: "user_idx", type: "key", attributes: ["userId"] }],
  },
};

const BUCKETS = [
  {
    id: "package_images",
    name: "Package Images",
    fileSecurity: false,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.team(TEAM_NAME)),
      Permission.update(Role.team(TEAM_NAME)),
      Permission.delete(Role.team(TEAM_NAME)),
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
  {
    id: "consultation_attachments",
    name: "Consultation Attachments",
    fileSecurity: false, // Allows public read if they have the ID (or we can secure it)
    // Better: Read Role.any() but Create Role.users()
    permissions: [
      Permission.read(Role.team(TEAM_NAME)), // Admin can read
      Permission.read(Role.any()), // Temporarily allow public read for ease
      Permission.create(Role.users()), // Authenticated users can upload
      Permission.create(Role.any()), // Allow Guests to upload too?
      Permission.delete(Role.team(TEAM_NAME)),
    ],
  },
  {
    id: "travel_documents",
    name: "Travel Documents",
    fileSecurity: true,
    permissions: [
      Permission.create(Role.users()),
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
  },
];

async function createColumnWithRetry(dbId: string, tableId: string, attr: any) {
  try {
    if (attr.type === "string") {
      await tableService.createStringColumn(
        dbId,
        tableId,
        attr.key,
        attr.size,
        attr.required,
        attr.default,
        attr.array,
      );
    } else if (attr.type === "integer") {
      await tableService.createIntegerColumn(
        dbId,
        tableId,
        attr.key,
        attr.required,
        -2147483648,
        2147483647,
        attr.default,
        attr.array,
      );
    } else if (attr.type === "double" || attr.type === "float") {
      await tableService.createFloatColumn(
        dbId,
        tableId,
        attr.key,
        attr.required,
        0,
        1000000000,
        attr.default,
        attr.array,
      );
    } else if (attr.type === "boolean") {
      await tableService.createBooleanColumn(
        dbId,
        tableId,
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

async function getAdminTeamId(): Promise<string | null> {
  try {
    const teamList = await teams.list();
    const existingTeam = teamList.teams.find((t) => t.name === TEAM_NAME);
    if (existingTeam) return existingTeam.$id;

    console.log(`Creating team '${TEAM_NAME}'...`);
    const newTeam = await teams.create(ID.unique(), TEAM_NAME);
    console.log(`✅ Team created (ID: ${newTeam.$id})`);
    return newTeam.$id;
  } catch (err: any) {
    console.error("Error managing team:", err.message);
    return null;
  }
}

async function setupAdmin(): Promise<{
  teamId: string | null;
  userId: string | null;
}> {
  console.log("🚀 Setting up Admin User & Team...");
  const teamId = await getAdminTeamId();

  // 2. Create or Get Admin User
  let userId = null;
  try {
    const userList = await users.list();
    const existingUser = userList.users.find((u) => u.email === ADMIN_EMAIL);

    if (existingUser) {
      console.log(
        `✅ User '${ADMIN_EMAIL}' already exists (ID: ${existingUser.$id})`,
      );
      userId = existingUser.$id;
      // Force update password to ensure it's known
      // await users.updatePassword(userId, ADMIN_PASS); // Uncomment to reset
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
      // Ignroe conflict
    }
  }
  return { teamId, userId };
}

async function seedAdminProfile(userId: string) {
  if (!userId) return;
  try {
    console.log("Ensuring admin profile exists in 'admins' collection...");
    const adminList = await databases
      .listDocuments(DATABASE_ID, "admins", [Query.equal("userId", userId)])
      .catch(() => ({ documents: [] }));

    if (adminList.documents.length === 0) {
      await databases.createDocument(DATABASE_ID, "admins", ID.unique(), {
        userId: userId,
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        role: "super_admin",
        isActive: true,
      });
      console.log("✅ Admin profile created in 'admins' collection.");
    } else {
      console.log("✅ Admin profile already exists.");
    }
  } catch (err: any) {
    console.warn("⚠️ Could not create admin profile:", err.message);
  }
}

async function init() {
  console.log("🚀 Starting Appwrite Database Init...");

  const { teamId: adminTeamId, userId: adminUserId } = await setupAdmin();

  // Replace permissions with dynamic ID if possible or use 'team:admin' if mapped ideally?
  // For this script, we assume 'admin' ID or use name lookup.
  // Actually, standard Role.team(id) is best.
  // We will assume the script runs on a project where we get/create the team.
  // Updating permissions dynamically in the COLLECTIONS object:
  if (adminTeamId) {
    const adminRole = Role.team(adminTeamId);
    // Packages
    COLLECTIONS.packages.permissions = [
      Permission.read(Role.any()),
      Permission.write(adminRole),
    ];
    // Addons
    COLLECTIONS.addons.permissions = [
      Permission.read(Role.any()),
      Permission.write(adminRole),
    ];
    // System Config
    COLLECTIONS.system_config.permissions = [
      Permission.read(Role.any()),
      Permission.write(adminRole),
    ];
    // Banners
    COLLECTIONS.banners.permissions = [
      Permission.read(Role.any()),
      Permission.write(adminRole),
    ];
    // Tickets, Messages, Payments, Reviews: Admin needs write access too
  }

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

  // 2. Tables
  for (const [colId, colConfig] of Object.entries(COLLECTIONS) as [
    string,
    any,
  ][]) {
    console.log(`Processing table '${colId}'...`);
    try {
      await tableService.getTable(DATABASE_ID, colId);
      console.log(`   ✅ Exists. Updating permissions...`);
      // Update logic...
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`   Creating...`);

        // Map attributes to columns definition
        const columns = colConfig.attributes.map((attr: any) => {
          // Base column config
          const col: any = {
            key: attr.key,
            type: attr.type,
            required: attr.required,
            array: attr.array,
            default: attr.default,
          };

          // Add type-specific properties
          if (attr.type === "string") {
            col.size = attr.size || 255;
          } else if (attr.type === "double" || attr.type === "integer") {
            if (attr.min !== undefined) col.min = attr.min;
            if (attr.max !== undefined) col.max = attr.max;
          }

          return col;
        });

        // Map indexes to index definition
        const indexes =
          colConfig.indexes?.map((idx: any) => ({
            key: idx.key,
            type: idx.type,
            attributes: idx.attributes,
          })) || [];

        await tableService.createTable({
          databaseId: DATABASE_ID,
          tableId: colId,
          name: colConfig.name,
          permissions: colConfig.permissions,
          rowSecurity: colConfig.documentSecurity,
          columns: columns,
          indexes: indexes,
        });
        continue; // Skip individual column creation for new tables
      }
    }

    // Columns (Only run for existing tables to ensure they are up to date)
    console.log(`   Syncing columns (for existing table)...`);
    for (const attr of colConfig.attributes) {
      await createColumnWithRetry(DATABASE_ID, colId, attr);
    }

    // Indexes (Only run for existing tables)
    if (colConfig.indexes) {
      for (const idx of colConfig.indexes) {
        try {
          // Note: createIndex doesn't support "if not exists" easily without listing.
          // We'll catch conflict (409) errors which is standard.
          await tableService.createIndex(
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
      console.log(`   ✅ Bucket '${bucket.id}' exists.`);
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

  if (adminUserId) {
    await seedAdminProfile(adminUserId);
  }

  console.log("\n🎉 Database Init Complete!");
}

init();
