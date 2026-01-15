import dotenv from "dotenv";
import { Client, Databases } from "node-appwrite";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = "travelling_db";
const COLLECTION_ID = "packages";

if (!API_KEY || !PROJECT_ID) {
  console.error("❌ Error: Missing required env vars.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function checkAttributes() {
  try {
    console.log(`Checking attributes for collection '${COLLECTION_ID}'...`);
    const response = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);

    const attributes = response.attributes;
    const itinerary = attributes.find((a: any) => a.key === "itinerary");

    if (itinerary) {
      console.log("✅ 'itinerary' attribute FOUND.");
      console.log(itinerary);
    } else {
      console.log("❌ 'itinerary' attribute NOT FOUND.");
      console.log("Attempting to create it now...");

      try {
        await databases.createStringAttribute(
          DATABASE_ID,
          COLLECTION_ID,
          "itinerary",
          10000,
          false,
        );
        console.log("✅ 'itinerary' created successfully.");
      } catch (createErr: any) {
        console.error("❌ Failed to create 'itinerary':", createErr.message);
      }
    }

    console.log("\nCurrent Attributes:");
    attributes.forEach((a: any) => console.log(`- ${a.key} (${a.type})`));
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

checkAttributes();
