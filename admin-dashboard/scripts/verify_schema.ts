import dotenv from "dotenv";
import { Client, Databases } from "node-appwrite";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const ENDPOINT =
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID =
  process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY =
  process.env.APPWRITE_API_KEY || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
const DATABASE_ID = "travelling_db";

console.log("Environment Check:");
console.log("- ENDPOINT:", ENDPOINT ? "✅ Set" : "❌ Missing");
console.log("- PROJECT_ID:", PROJECT_ID ? "✅ Set" : "❌ Missing");
console.log("- API_KEY:", API_KEY ? "✅ Set" : "❌ Missing");

if (!API_KEY || !PROJECT_ID) {
  console.error("❌ Error: Missing required env vars.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function verifySchema() {
  console.log("🔍 Verifying 'packages' Collection Schema...");

  try {
    // 1. Get Attributes
    const attributes = await databases.listAttributes(DATABASE_ID, "packages");

    console.log(`\n📋 Found ${attributes.total} attributes.`);

    const itineraryAttr = attributes.attributes.find(
      (a: any) => a.key === "itinerary",
    );

    if (itineraryAttr) {
      console.log("\n✅ 'itinerary' attribute FOUND:");
      console.log(JSON.stringify(itineraryAttr, null, 2));
    } else {
      console.error("\n❌ 'itinerary' attribute NOT found!");
    }

    // 2. Check Data
    console.log("\n📦 Checking sample data...");
    const documents = await databases.listDocuments(
      DATABASE_ID,
      "packages",
      [],
    );

    if (documents.documents.length > 0) {
      const sample = documents.documents[0];
      console.log(`\nSample Package: ${sample.title}`);
      console.log("Itinerary Type:", typeof sample.itinerary);
      console.log(
        "Itinerary Value (first 100 chars):",
        String(sample.itinerary).substring(0, 100) + "...",
      );
    } else {
      console.log("No packages found to inspect.");
    }
  } catch (error: any) {
    console.error("Verification Failed:", error.message);
  }
}

verifySchema();
