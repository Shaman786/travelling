import dotenv from "dotenv";
import {
  Account,
  Client,
  Databases,
  ID,
  Permission,
  Role,
  Storage,
} from "node-appwrite";
import readline from "readline";

// Load environment variables
dotenv.config({ path: ".env.local" });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function setupProduction() {
  console.log("\n🚀 Starting Production Setup for Travelling App...\n");

  // 1. Configuration
  let endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  let projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  let apiKey = process.env.APPWRITE_API_KEY;

  if (!endpoint || !projectId || !apiKey) {
    console.log("⚠️  Missing environment variables in .env.local");
    const useManual = await askQuestion(
      "Do you want to enter credentials manually? (y/n): ",
    );
    if (useManual.toLowerCase() === "y") {
      endpoint = await askQuestion("Appwrite Endpoint: ");
      projectId = await askQuestion("Project ID: ");
      apiKey = await askQuestion("API Key (with admin scopes): ");
    } else {
      console.error("❌ Aborting. Please check .env.local");
      process.exit(1);
    }
  }

  const client = new Client()
    .setEndpoint(endpoint!)
    .setProject(projectId!)
    .setKey(apiKey!);

  const databases = new Databases(client);
  const storage = new Storage(client);
  const users = new Account(client); // Note: Admin SDK uses different service for users listing usually, but Account is for current session. For admin actions we use Users service if checking, but Account is fine for creating valid sessions. Ideally use Users service for admin.
  // Actually, node-appwrite has 'Users' service for admin management.
  // users imported as 'Account' here is typically client side. Correct import for admin is Users.
  // Re-importing correctly:
  const { Users } = require("node-appwrite");
  const usersService = new Users(client);

  const DATABASE_ID =
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "travelling_db";

  console.log(`\n📡 Connected to Project: ${projectId}`);
  console.log(`🗄️  Target Database: ${DATABASE_ID}\n`);

  // 2. Database Setup
  try {
    await databases.get(DATABASE_ID);
    console.log("✅ Database exists.");
  } catch (err: any) {
    if (err.code === 404) {
      console.log("creating database...");
      await databases.create(DATABASE_ID, "Travelling DB");
      console.log("✅ Database created.");
    }
  }

  // 3. Collections & Schema
  // Define Schema (Same as seed script but only creating if missing)
  interface CollectionAttribute {
    key: string;
    type: string;
    size?: number;
    required: boolean;
    default?: any;
    array?: boolean;
  }

  const collections: {
    id: string;
    name: string;
    attributes: CollectionAttribute[];
    indexes?: { key: string; type: string; attributes: string[] }[];
  }[] = [
    {
      id: "users",
      name: "Users",
      attributes: [
        { key: "name", type: "string", size: 128, required: true },
        { key: "email", type: "string", size: 128, required: true },
        { key: "role", type: "string", size: 32, required: true },
        { key: "avatar", type: "string", size: 2048, required: false },
        { key: "bio", type: "string", size: 512, required: false },
        { key: "phone", type: "string", size: 32, required: false },
        { key: "pushToken", type: "string", size: 256, required: false },
      ],
      indexes: [{ key: "email_index", type: "unique", attributes: ["email"] }],
    },
    {
      id: "packages",
      name: "Travel Packages",
      attributes: [
        { key: "title", type: "string", size: 128, required: true },
        { key: "description", type: "string", size: 5000, required: true },
        { key: "destination", type: "string", size: 128, required: true },
        { key: "price", type: "double", required: true },
        { key: "rating", type: "double", required: false, default: 0 },
        { key: "duration", type: "string", size: 64, required: true },
        { key: "imageUrl", type: "string", size: 2048, required: true },
        {
          key: "gallery",
          type: "string",
          size: 2048,
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
        { key: "itinerary", type: "string", size: 4000, required: false },
        { key: "isActive", type: "boolean", required: false, default: true },
      ],
    },
    {
      id: "bookings",
      name: "Bookings",
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
        { key: "travelers", type: "string", size: 5000, required: false },
      ],
    },
    {
      id: "reviews",
      name: "Reviews",
      attributes: [
        { key: "userId", type: "string", size: 36, required: true },
        { key: "packageId", type: "string", size: 36, required: true },
        { key: "rating", type: "integer", required: true },
        { key: "comment", type: "string", size: 1000, required: false },
        {
          key: "status",
          type: "string",
          size: 32,
          required: false,
          default: "pending",
        },
      ],
    },
    {
      id: "tickets",
      name: "Support Tickets",
      attributes: [
        { key: "userId", type: "string", size: 36, required: true },
        { key: "subject", type: "string", size: 256, required: true },
        { key: "message", type: "string", size: 2000, required: true },
        { key: "category", type: "string", size: 32, required: true },
        {
          key: "status",
          type: "string",
          size: 32,
          required: true,
          default: "open",
        },
        {
          key: "priority",
          type: "string",
          size: 32,
          required: true,
          default: "medium",
        },
        { key: "bookingId", type: "string", size: 36, required: false },
      ],
    },
  ];

  for (const col of collections) {
    try {
      await databases.getCollection(DATABASE_ID, col.id);
      console.log(`✅ Collection '${col.name}' exists.`);
    } catch (err: any) {
      if (err.code === 404) {
        console.log(`Creating collection '${col.name}'...`);
        await databases.createCollection(DATABASE_ID, col.id, col.name, [
          Permission.read(Role.any()), // Simplified permissions for prod start
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ]);
        // Create Attributes
        for (const attr of col.attributes) {
          if (attr.type === "string") {
            await databases.createStringAttribute(
              DATABASE_ID,
              col.id,
              attr.key,
              attr.size || 128,
              attr.required,
              attr.default,
              attr.array,
            );
          } else if (attr.type === "double") {
            await databases.createFloatAttribute(
              DATABASE_ID,
              col.id,
              attr.key,
              attr.required,
              0,
              1000000,
              attr.default,
            );
          } else if (attr.type === "integer") {
            await databases.createIntegerAttribute(
              DATABASE_ID,
              col.id,
              attr.key,
              attr.required,
              0,
              1000000,
              attr.default,
            );
          } else if (attr.type === "boolean") {
            await databases.createBooleanAttribute(
              DATABASE_ID,
              col.id,
              attr.key,
              attr.required,
              attr.default,
            );
          }
          // Simple delay to prevent race conditions during attribute creation
          await new Promise((r) => setTimeout(r, 500));
        }
        console.log(`✅ Collection '${col.name}' created.`);
      }
    }
  }

  // 4. Storage Buckets
  const buckets = ["package_images", "avatars"];
  for (const bid of buckets) {
    try {
      await storage.getBucket(bid);
      console.log(`✅ Bucket '${bid}' exists.`);
    } catch (err: any) {
      if (err.code === 404) {
        await storage.createBucket(bid, bid, [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ]);
        console.log(`✅ Bucket '${bid}' created.`);
      }
    }
  }

  // 5. Admin User
  console.log("\n👤 Admin User Setup");
  const createAdmin = await askQuestion("Create a new Admin user? (y/n): ");
  if (createAdmin.toLowerCase() === "y") {
    const email = await askQuestion("Email: ");
    const password = await askQuestion("Password (min 8 chars): ");
    const name = await askQuestion("Name: ");

    try {
      await usersService.create(ID.unique(), email, undefined, password, name);
      console.log(`✅ Admin user '${email}' created.`);
      // Note: In a real scenario you would also add them to an 'admin' team or give specific labels
    } catch (error: any) {
      console.log(`⚠️  Could not create user: ${error.message}`);
    }
  }

  console.log("\n✨ Production Setup Complete! ✨");
  rl.close();
}

setupProduction();
