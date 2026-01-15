import dotenv from "dotenv";
import { Client, Databases, Permission, Role } from "node-appwrite";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  console.error("Error: Missing required environment variables.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function createCollection(id, name, attributes) {
  try {
    // Check if exists first
    try {
      await databases.getCollection(databaseId, id);
      console.log(`Collection '${name}' (${id}) already exists.`);
      return;
    } catch (e) {
      if (e.code !== 404) throw e;
    }

    console.log(`Creating collection '${name}' (${id})...`);
    await databases.createCollection(
      databaseId,
      id,
      name,
      [
        Permission.read(Role.any()),
        Permission.write(Role.users()), // Restricted to authenticated users
        Permission.read(Role.users()),
        Permission.write(Role.users()),
      ]
    );

    console.log(`Creating attributes for '${name}'...`);
    for (const attr of attributes) {
        try {
            switch (attr.type) {
                case "string":
                await databases.createStringAttribute(databaseId, id, attr.key, attr.size, attr.required);
                break;
                case "integer":
                await databases.createIntegerAttribute(databaseId, id, attr.key, attr.required);
                break;
                case "double":
                await databases.createFloatAttribute(databaseId, id, attr.key, attr.required);
                break;
                case "boolean":
                await databases.createBooleanAttribute(databaseId, id, attr.key, attr.required);
                break;
                case "datetime":
                await databases.createDatetimeAttribute(databaseId, id, attr.key, attr.required);
                break;
            }
            console.log(` - Created attribute: ${attr.key}`);
            // Small delay to prevent rate limits or race conditions
            await new Promise((r) => setTimeout(r, 500));
        } catch (error) {
            console.warn(`   Failed to create attribute ${attr.key}: ${error.message}`);
        }
    }
    console.log(`Collection '${name}' created successfully.`);
  } catch (error) {
    console.error(`Error creating collection '${name}':`, error.message);
  }
}

async function fixMissing() {
  // 1. ADDONS Collection
  await createCollection("addons", "Addons", [
    { key: "name", type: "string", size: 128, required: true },
    { key: "description", type: "string", size: 1024, required: true },
    { key: "price", type: "double", required: true },
    { key: "type", type: "string", size: 32, required: true }, // per_person, per_booking
    { key: "icon", type: "string", size: 255, required: true },
    { key: "isActive", type: "boolean", required: true },
  ]);

  // 2. TICKET MESSAGES Collection
  await createCollection("ticket_messages", "Ticket Messages", [
    { key: "ticketId", type: "string", size: 36, required: true },
    { key: "message", type: "string", size: 10000, required: true },
    { key: "senderId", type: "string", size: 36, required: true },
    { key: "isAdmin", type: "boolean", required: true },
    { key: "createdAt", type: "string", size: 64, required: true }, // Using string for ISO date flexibility
  ]);
}

fixMissing();
