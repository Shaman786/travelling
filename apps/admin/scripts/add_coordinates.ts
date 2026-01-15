import dotenv from "dotenv";
import { Client, Databases, Query } from "node-appwrite";
import path from "path";

// Load environment variables from .env.local
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

const databases = new Databases(client);

// Sample coordinates for popular destinations
const DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
  // India
  goa: { lat: 15.2993, lng: 74.124 },
  kerala: { lat: 10.8505, lng: 76.2711 },
  rajasthan: { lat: 27.0238, lng: 74.2179 },
  himachal: { lat: 31.1048, lng: 77.1734 },
  kashmir: { lat: 34.0837, lng: 74.7973 },
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  agra: { lat: 27.1767, lng: 78.0081 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  // International
  bali: { lat: -8.4095, lng: 115.1889 },
  paris: { lat: 48.8566, lng: 2.3522 },
  london: { lat: 51.5074, lng: -0.1278 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  singapore: { lat: 1.3521, lng: 103.8198 },
  thailand: { lat: 15.87, lng: 100.9925 },
  maldives: { lat: 3.2028, lng: 73.2207 },
  switzerland: { lat: 46.8182, lng: 8.2275 },
  "new york": { lat: 40.7128, lng: -74.006 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  rome: { lat: 41.9028, lng: 12.4964 },
};

function findCoordinates(
  destination: string,
  country: string,
): { lat: number; lng: number } {
  const destLower = destination.toLowerCase();
  const countryLower = country.toLowerCase();

  // Try exact match first
  for (const [key, coords] of Object.entries(DESTINATION_COORDS)) {
    if (destLower.includes(key) || key.includes(destLower)) {
      return coords;
    }
  }

  // Try country match
  for (const [key, coords] of Object.entries(DESTINATION_COORDS)) {
    if (countryLower.includes(key) || key.includes(countryLower)) {
      return coords;
    }
  }

  // Default to India center with some randomness
  return {
    lat: 20.5937 + (Math.random() - 0.5) * 10,
    lng: 78.9629 + (Math.random() - 0.5) * 10,
  };
}

async function addCoordinatesToPackages() {
  console.log("🗺️ Adding coordinates to packages...\n");

  try {
    const response = await databases.listDocuments(DATABASE_ID, "packages", [
      Query.limit(100),
    ]);

    console.log(`Found ${response.documents.length} packages.\n`);

    for (const pkg of response.documents) {
      const coords = findCoordinates(pkg.destination || "", pkg.country || "");

      console.log(`📍 ${pkg.title}`);
      console.log(`   Destination: ${pkg.destination}, ${pkg.country}`);
      console.log(
        `   Coordinates: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      );

      try {
        await databases.updateDocument(DATABASE_ID, "packages", pkg.$id, {
          latitude: coords.lat,
          longitude: coords.lng,
        });
        console.log(`   ✅ Updated!\n`);
      } catch (err: any) {
        console.log(`   ❌ Error: ${err.message}\n`);
      }
    }

    console.log("🎉 Done adding coordinates!");
  } catch (err: any) {
    console.error("Error fetching packages:", err.message);
  }
}

addCoordinatesToPackages();
