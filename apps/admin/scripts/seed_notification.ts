
import dotenv from "dotenv";
import { Client, Databases, ID, Query } from "node-appwrite";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), "apps/admin/.env.local") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/mobile/.env") });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const API_KEY = process.env.APPWRITE_API_KEY || "";
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "travelling_db";

if (!API_KEY || !PROJECT_ID) {
  console.error("❌ Error: Missing required env vars (API_KEY, PROJECT_ID).");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function seedNotification() {
  try {
    console.log("🚀 Seeding Test Notification...");

    // 1. Get a user to send to (try admin first, or just first user)
    // For this test, we'll try to find the admin user we set up, or just *any* user.
    // Ideally we want the user currently logged in to the mobile app.
    // Since we don't know who that is easily, let's fetch the most recently created user.
    
    // Note: If you know your specific User ID, you can hardcode it here for testing.
    // const targetUserId = "YOUR_USER_ID"; 

    // Fetch users (requires Users API or just querying a collection if we sync'd them, 
    // but typically we don't have direct access to Auth Users list without Users API which needs API Key with scope)
    // We have API Key, so let's import Users service? No, let's just use the 'users' collection we have in DB if populated,
    // OR just use the 'admins' table to find an ID we know.
    
    // Better: Just create a notification for a hardcoded ID if provided, otherwise fetch from 'users' collection properly.
    
    // Let's assume we want to target the user from the 'users' collection (database) which mirrors auth.
    
    // DEBUG: Check attributes
    try {
        console.log("Checking 'notifications' collection attributes...");
        // TablesDB alias is 'databases' in node-appwrite for newer SDKs, or we can use listAttributes
        const attrs = await databases.listAttributes(DATABASE_ID, "notifications");
        console.log("Existing Attributes:", attrs.attributes.map((a: any) => a.key).join(", "));
    } catch (e: any) {
        console.error("Failed to list attributes:", e.message);
    }

    const userList = await databases.listDocuments(DATABASE_ID, "users", [
       Query.orderDesc("$createdAt"),
       Query.limit(1)
    ]);

    if (userList.documents.length === 0) {
        console.error("❌ No users found in 'users' database collection to send notification to.");
        return;
    }

    const targetUser = userList.documents[0];
    const targetUserId = targetUser.userId || targetUser.$id; // Depending on schema, userId might be the field or the doc ID itself.

    console.log(`Found target user: ${targetUser.name} (${targetUserId})`);

    // 2. Create Notification
    const notification = await databases.createDocument(
      DATABASE_ID,
      "notifications",
      ID.unique(),
      {
        userId: targetUserId,
        title: "Test Notification 🔔",
        message: `This is a test notification sent at ${new Date().toLocaleTimeString()} to verify the bell icon!`,
        type: "system",
        isRead: false,
        createdAt: new Date().toISOString()
      }
    );

    console.log(`✅ Notification created! ID: ${notification.$id}`);
    console.log("👉 Check your mobile app Home screen. The bell icon should now have a badge (reload if needed).");

  } catch (error: any) {
    console.error("❌ Error seeding notification:", error.message);
  }
}

seedNotification();
