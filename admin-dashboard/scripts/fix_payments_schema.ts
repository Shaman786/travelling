import dotenv from "dotenv";
import { Client, Permission, Role, TablesDB } from "node-appwrite";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY =
  process.env.APPWRITE_API_KEY || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
const DATABASE_ID = "travelling_db";

if (!API_KEY || !PROJECT_ID) {
  console.error("❌ Error: Missing required env vars.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const tables = new TablesDB(client);

async function createColumn(
  dbId: string,
  tableId: string,
  key: string,
  type: "string" | "double" | "integer" | "boolean",
  size?: number,
  required: boolean = false,
  array: boolean = false,
) {
  try {
    console.log(`   👉 Attempting to create column '${key}'...`);
    if (type === "string") {
      await tables.createStringColumn(
        dbId,
        tableId,
        key,
        size || 256,
        required,
        undefined,
        array,
      );
    } else if (type === "double") {
      await tables.createFloatColumn(
        dbId,
        tableId,
        key,
        required,
        undefined,
        undefined,
        undefined,
        array,
      );
    }
    console.log(`   ✅ Created column '${key}'`);
  } catch (error: any) {
    if (error.code === 409) {
      console.log(`   ℹ️ Column '${key}' already exists.`);
    } else {
      console.error(`   ❌ Failed to create column '${key}': ${error.message}`);
    }
  }
}

async function fixSchema() {
  console.log("🛠️ Starting Focused Schema Fix...");

  // 1. Fix Bookings Table
  console.log("\n📦 Checking 'bookings' table...");
  try {
    await tables.getTable(DATABASE_ID, "bookings");
    await createColumn(
      DATABASE_ID,
      "bookings",
      "paymentStatus",
      "string",
      32,
      false,
    );
    await createColumn(
      DATABASE_ID,
      "bookings",
      "paymentId",
      "string",
      128,
      false,
    );
    await createColumn(
      DATABASE_ID,
      "bookings",
      "statusHistory",
      "string",
      5000,
      false,
    );
  } catch (error: any) {
    console.error(
      "❌ 'bookings' table not found! Please run the full seed script first.",
    );
  }

  // 2. Fix Payments Table
  console.log("\n💳 Checking 'payments' table...");
  try {
    try {
      await tables.getTable(DATABASE_ID, "payments");
      console.log("   ✅ 'payments' table exists.");
    } catch (error: any) {
      if (error.code === 404) {
        console.log("   ⚠️ 'payments' table missing. Creating...");
        await tables.createTable(
          DATABASE_ID,
          "payments",
          "Payments",
          [
            Permission.create(Role.users()),
            Permission.read(Role.users()),
            Permission.update(Role.team("695f5c530000d10e3388")), // Admin
            Permission.delete(Role.team("695f5c530000d10e3388")),
          ],
          true,
        );
        console.log("   ✅ Created 'payments' table.");
      } else {
        throw error;
      }
    }

    // Create Columns
    await createColumn(
      DATABASE_ID,
      "payments",
      "bookingId",
      "string",
      36,
      true,
    );
    await createColumn(DATABASE_ID, "payments", "userId", "string", 36, true);
    await createColumn(
      DATABASE_ID,
      "payments",
      "amount",
      "double",
      undefined,
      true,
    );
    await createColumn(DATABASE_ID, "payments", "currency", "string", 3, true);
    await createColumn(DATABASE_ID, "payments", "status", "string", 32, true);
    await createColumn(DATABASE_ID, "payments", "method", "string", 32, false);
    await createColumn(
      DATABASE_ID,
      "payments",
      "gatewayProvider",
      "string",
      32,
      false,
    );
    await createColumn(
      DATABASE_ID,
      "payments",
      "gatewayOrderId",
      "string",
      128,
      false,
    );
    await createColumn(
      DATABASE_ID,
      "payments",
      "gatewayPaymentId",
      "string",
      128,
      false,
    );
  } catch (error: any) {
    console.error(`❌ Failed to process 'payments' table: ${error.message}`);
  }

  console.log("\n✅ Targeted Fix Complete!");
}

fixSchema();
