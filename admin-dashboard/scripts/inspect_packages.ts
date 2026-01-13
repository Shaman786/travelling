import dotenv from "dotenv";
import { Client, TablesDB } from "node-appwrite";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY =
  process.env.APPWRITE_API_KEY || process.env.NEXT_PUBLIC_APPWRITE_API_KEY;
const DATABASE_ID = "travelling_db";

if (!API_KEY) {
  console.error("API_KEY is missing");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID!)
  .setKey(API_KEY);

const tables = new TablesDB(client) as any;

async function inspectPackages() {
  try {
    console.log(`📦 Inspecting 'packages' columns/attributes...`);

    let response;
    if (typeof tables.listColumns === "function") {
      console.log("Using tables.listColumns...");
      response = await tables.listColumns(DATABASE_ID, "packages");
      console.log(`📊 Total Columns: ${response.total}`);
      response.columns.forEach((col: any) => {
        console.log(`- ${col.key} (${col.type})`);
      });
    } else if (typeof tables.listAttributes === "function") {
      console.log("Using tables.listAttributes...");
      response = await tables.listAttributes(DATABASE_ID, "packages");
      console.log(`📊 Total Attributes: ${response.total}`);
      response.attributes.forEach((attr: any) => {
        console.log(`- ${attr.key} (${attr.type})`);
      });
    } else {
      console.log(
        "❌ Could not find listColumns or listAttributes method on TablesDB.",
      );
      console.log(
        "Available keys:",
        Object.keys(Object.getPrototypeOf(tables)),
      );
    }

    // Inspect Indexes
    console.log("\n🔍 Inspecting Indexes...");
    try {
      const indexResponse = await tables.listIndexes(DATABASE_ID, "packages");
      console.log(`📊 Total Indexes: ${indexResponse.total}`);
      indexResponse.indexes.forEach((idx: any) => {
        console.log(
          `- [${idx.key}] Type: ${idx.type}, Attrs: ${idx.attributes.join(", ")}`,
        );
      });
    } catch (err: any) {
      console.log("Could not list indexes: " + err.message);
    }
  } catch (e: any) {
    console.error("Error inspecting packages:", e.message);
  }
}

inspectPackages();
