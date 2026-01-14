import dotenv from "dotenv";
import { Client, Databases } from "node-appwrite";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

console.log("--- Configuration Debug ---");
console.log(`Endpoint: ${endpoint}`);
console.log(`Project ID: ${projectId}`);
console.log(`Database ID: ${databaseId}`);
console.log(`API Key Provided: ${!!apiKey}`);

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error("Error: Missing required environment variables.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function listCollections() {
  try {
    console.log("\n--- Fetching Collections ---");
    const response = await databases.listCollections(databaseId);
    
    console.log(`Found ${response.total} collections:`);
    response.collections.forEach((col) => {
      console.log(`- Name: "${col.name}" | ID: "${col.$id}"`);
    });

  } catch (error) {
    console.error("Error fetching collections:", error.message);
  }
}

listCollections();
