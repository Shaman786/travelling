import dotenv from "dotenv";
import { Client, Databases } from "node-appwrite";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY =
  process.env.APPWRITE_API_KEY || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
const DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "travelling_db";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function inspect() {
  console.log("Inspecting ticket_messages attributes...");
  try {
    // "ticket_messages" is the ID we expect
    const attrs = await databases.listAttributes(
      DATABASE_ID,
      "ticket_messages",
    );
    attrs.attributes.forEach((a: any) => {
      console.log(
        `- ${a.key} [${a.type}] required=${a.required}, default=${a.default}`,
      );
    });
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

inspect();
