import dotenv from "dotenv";
import { Client, Databases, ID, Query } from "node-appwrite";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Config
const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY =
  process.env.APPWRITE_API_KEY || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "travelling_db";

if (!API_KEY || !PROJECT_ID) {
  console.error("❌ Error: Missing required env vars.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function verifyTable(
  tableId: string,
  testData: any,
  queryCheck: { attr: string; val: any },
) {
  console.log(`\n🔍 Verifying Table: ${tableId}...`);
  try {
    // 1. Create
    const docId = ID.unique();
    const doc = await databases.createDocument(
      DATABASE_ID,
      tableId,
      docId,
      testData,
    );
    console.log(`   ✅ Create Document: Success (${doc.$id})`);

    // 2. Query (using Query class as requested)
    const result = await databases.listDocuments(DATABASE_ID, tableId, [
      Query.equal(queryCheck.attr, queryCheck.val),
    ]);

    const found = result.documents.find((d) => d.$id === docId);
    if (found) {
      console.log(
        `   ✅ Query (Equal): Success (Found doc by ${queryCheck.attr})`,
      );
    } else {
      console.error(`   ❌ Query (Equal): Failed to find doc!`);
    }

    // 3. Delete
    await databases.deleteDocument(DATABASE_ID, tableId, docId);
    console.log(`   ✅ Delete Document: Success`);
  } catch (error: any) {
    console.error(`   ❌ Failed: ${error.message}`);
  }
}

async function run() {
  console.log("🚀 Starting Database Verification (Query Debugger)...");

  // Test Packages
  await verifyTable(
    "packages",
    {
      title: "Debug Package",
      destination: "Debug City",
      country: "Debug Land",
      category: "Adventure",
      price: 99.99,
      duration: "3 Days",
      isActive: true,
    },
    { attr: "title", val: "Debug Package" },
  );

  // Test Addons
  await verifyTable(
    "addons",
    {
      name: "Debug Addon",
      description: "Test",
      price: 10,
      type: "per_person",
      icon: "test-icon",
      isActive: true,
    },
    { attr: "type", val: "per_person" },
  );

  // Test Tickets
  await verifyTable(
    "tickets",
    {
      userId: "debug-user-id", // Mock ID
      subject: "Debug Issue",
      message: "This is a test ticket",
      category: "tech",
      status: "open",
      priority: "high",
    },
    { attr: "status", val: "open" },
  );

  console.log("\n✨ Verification Complete.");
}

run();
