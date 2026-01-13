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

// RLS SECURITY FIX
// We must REMOVE 'read', 'update', 'delete' for Role.users() (Any Authenticated User)
// and rely STRICTLY on Document Security (Owner only).
// Only 'create' permission is needed for Role.users().

async function fixSecurity(tableId: string, name: string) {
  try {
    console.log(`🔒 Securing table '${name}' (${tableId})...`);

    // Desired Permissions:
    // Create: Role.users() (Anyone logged in can create a record)
    // Read/Update/Delete: Role.any()?? NO.
    // If documentSecurity is TRUE, the creator is Owner.
    // So we remove explicit read/update/delete for generic roles.

    const permissions = [
      Permission.create(Role.users()),
      // NO read/update/delete for generic 'users' role.
      // Owner gets implicit full rights via documentSecurity: true
    ];

    await tables.updateTable(
      DATABASE_ID,
      tableId,
      name,
      permissions,
      true, // documentSecurity = true
    );
    console.log(`   ✅ Secured '${name}'. Global read access removed.`);
  } catch (error: any) {
    console.error(`   ❌ Failed to secure '${name}': ${error.message}`);
  }
}

async function run() {
  console.log("🛡️ Applying Strict Security Rules...");

  // 1. Bookings (User specific data)
  await fixSecurity("bookings", "Bookings");

  // 2. Payments (User specific data)
  await fixSecurity("payments", "Payments");

  // 3. Reviews (Public Read OK, but Update/Delete restricted)
  // Reviews are tricky. We want PUBLIC to read them.
  // So Role.any() READ is okay for reviews.
  // fixSecurity("reviews") -> No, custom logic needed.

  // 4. Users (User specific)
  // Actually 'users' table holds user profiles.
  // Should other users read my profile? Maybe limited.
  // For now, let's lock it down to owner only to stop leaks.
  // Unless "Social" features exist.
  await fixSecurity("users", "Users");

  console.log("\n✅ Security Patch Complete!");
}

run();
