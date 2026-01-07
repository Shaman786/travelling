/**
 * Seed Script for Appwrite Database
 * 
 * Run with: npx ts-node scripts/seed-packages.ts
 * 
 * Make sure to set your environment variables first!
 */

import { Client, Databases, ID } from "node-appwrite";

// Configuration - Update these or use environment variables
const ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "";
const API_KEY = process.env.APPWRITE_API_KEY || ""; // Server API key with write access
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "travelling_db";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

const samplePackages = [
  {
    title: "Kerala Backwater Bliss",
    destination: "Kerala",
    country: "India",
    category: "beach",
    price: 450,
    duration: "6 Days / 5 Nights",
    rating: 4.8,
    reviewCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596325067464-f6eb73f00994?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Experience the serene backwaters, tea plantations of Munnar, and the pristine beaches of Kovalam in this comprehensive Kerala tour.",
    highlights: ["Houseboat Stay", "Tea Plantations", "Kathakali Dance", "Ayurveda Spa"],
    inclusions: ["Airport Transfers", "Houseboat Stay", "Breakfast & Dinner", "Sightseeing Cabs"],
    exclusions: ["Flights", "Lunch", "Personal expenses"],
    itinerary: [
      { day: 1, title: "Arrival in Cochin", description: "Arrive at Cochin Airport and transfer to Munnar.", activities: ["Airport Pickup", "Scenic Drive"] },
      { day: 2, title: "Munnar Sightseeing", description: "Visit Tea Museum, Mattupetty Dam, and Eco Point.", activities: ["Tea Museum", "Mattupetty Dam"] }
    ],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    title: "Dubai Luxury Escape",
    destination: "Dubai",
    country: "UAE",
    category: "luxury",
    price: 899,
    duration: "5 Days / 4 Nights",
    rating: 4.9,
    reviewCount: 340,
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Witness the glitz and glamour of Dubai. From the heights of Burj Khalifa to the thrill of desert safaris.",
    highlights: ["Burj Khalifa", "Desert Safari", "Dubai Mall", "Palm Jumeirah"],
    inclusions: ["5-Star Hotel", "Burj Khalifa Tickets", "Desert Safari with BBQ", "Airport Transfers"],
    exclusions: ["Flights", "Visa fees", "Personal shopping"],
    itinerary: [
      { day: 1, title: "Arrival & Dhow Cruise", description: "Arrive at Dubai and enjoy evening Dhow Cruise.", activities: ["Airport Transfer", "Dhow Cruise"] },
      { day: 2, title: "City Tour & Burj Khalifa", description: "Half-day city tour and Burj Khalifa visit.", activities: ["Dubai Mall", "Burj Khalifa"] }
    ],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    title: "Golden Triangle Royal Tour",
    destination: "Delhi-Agra-Jaipur",
    country: "India",
    category: "cultural",
    price: 550,
    duration: "5 Days / 4 Nights",
    rating: 4.7,
    reviewCount: 210,
    imageUrl: "https://images.unsplash.com/photo-1564659130709-2c764493e06c?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1564659130709-2c764493e06c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Explore the cultural heritage of India with the classic Golden Triangle circuit - Delhi, Agra, and Jaipur.",
    highlights: ["Taj Mahal", "Amber Fort", "Qutub Minar", "Hawa Mahal"],
    inclusions: ["5-Star Hotels", "Private Chauffeur", "Monument Entries", "Guide Services"],
    exclusions: ["Flights", "Tips", "Camera fees"],
    itinerary: [
      { day: 1, title: "Delhi Exploration", description: "Visit Qutub Minar, India Gate, and Lotus Temple.", activities: ["Qutub Minar", "India Gate"] },
      { day: 2, title: "Delhi to Agra", description: "Drive to Agra and visit Taj Mahal at sunset.", activities: ["Agra Fort", "Taj Mahal"] }
    ],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    title: "London & Scottish Highlands",
    destination: "London-Edinburgh",
    country: "United Kingdom",
    category: "adventure",
    price: 1200,
    duration: "8 Days / 7 Nights",
    rating: 4.6,
    reviewCount: 95,
    imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506377550980-bc8296f4dc66?q=80&w=800&auto=format&fit=crop"
    ],
    description: "A journey through the royal history of London to the breathtaking landscapes of Scotland.",
    highlights: ["Big Ben", "Edinburgh Castle", "Loch Ness", "Scottish Highlands"],
    inclusions: ["4-Star Hotels", "Train to Edinburgh", "Highlands Tour", "Breakfast Daily"],
    exclusions: ["Flights", "Visa", "Lunch & Dinner"],
    itinerary: [
      { day: 1, title: "London Arrival", description: "Arrive in London and check into hotel.", activities: ["Airport Transfer", "Leisure Walk"] },
      { day: 2, title: "London Tour", description: "Visit Buckingham Palace, Big Ben, and London Eye.", activities: ["Buckingham Palace", "London Eye"] }
    ],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    title: "Maldives Paradise Retreat",
    destination: "Maldives",
    country: "Maldives",
    category: "beach",
    price: 1500,
    duration: "4 Days / 3 Nights",
    rating: 4.9,
    reviewCount: 280,
    imageUrl: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=800&auto=format&fit=crop"
    ],
    description: "Escape to the crystal-clear waters and overwater villas of the Maldives for the ultimate beach getaway.",
    highlights: ["Overwater Villa", "Snorkeling", "Sunset Cruise", "Spa Treatment"],
    inclusions: ["Overwater Villa", "All Meals", "Speedboat Transfers", "Water Sports"],
    exclusions: ["Flights", "Alcoholic beverages", "Premium excursions"],
    itinerary: [
      { day: 1, title: "Island Arrival", description: "Speedboat transfer to resort and villa check-in.", activities: ["Speedboat Transfer", "Welcome Drink"] },
      { day: 2, title: "Water Activities", description: "Snorkeling, kayaking, and beach relaxation.", activities: ["Snorkeling", "Sunset Cruise"] }
    ],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

async function seedPackages() {
  console.log("🌱 Starting database seed...\n");

  if (!PROJECT_ID || !API_KEY) {
    console.error("❌ Missing PROJECT_ID or API_KEY. Set environment variables first.");
    process.exit(1);
  }

  for (const pkg of samplePackages) {
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        "packages",
        ID.unique(),
        pkg
      );
      console.log(`✅ Created: ${pkg.title} (${doc.$id})`);
    } catch (error: any) {
      console.error(`❌ Failed to create ${pkg.title}:`, error.message);
    }
  }

  console.log("\n🎉 Seed complete!");
}

seedPackages();
