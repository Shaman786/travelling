/**
 * Production Demo Seed Script
 *
 * Seeds realistic data for demo purposes:
 * - Travel Packages (5 premium destinations)
 * - Users (3 sample customers)
 * - Bookings (5 sample bookings at various stages)
 * - Consultations (4 sample consultation requests)
 * - Chat Messages (Sample conversation)
 *
 * Run with: npx ts-node scripts/seed-demo-data.ts
 */

import dotenv from "dotenv";
import { Client, ID, TablesDB } from "node-appwrite";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ENDPOINT =
  process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "";
const API_KEY = process.env.APPWRITE_API_KEY || "";
const DATABASE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "travelling_db";

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const tables = new TablesDB(client);

// ============ SAMPLE DATA ============

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
    imageUrl:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800",
    ],
    description:
      "Experience the serene backwaters, tea plantations of Munnar, and pristine beaches of Kovalam.",
    highlights: [
      "Houseboat Stay",
      "Tea Plantations",
      "Kathakali Dance",
      "Ayurveda Spa",
    ],
    inclusions: [
      "Airport Transfers",
      "Houseboat Stay",
      "Breakfast & Dinner",
      "Sightseeing Cabs",
    ],
    exclusions: ["Flights", "Lunch", "Personal expenses"],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Cochin",
        description: "Arrive and transfer to Munnar.",
        activities: ["Airport Pickup"],
      },
    ],
    isActive: true,
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
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=800",
    ],
    description:
      "Witness the glitz and glamour of Dubai. From Burj Khalifa to desert safaris.",
    highlights: [
      "Burj Khalifa",
      "Desert Safari",
      "Dubai Mall",
      "Palm Jumeirah",
    ],
    inclusions: [
      "5-Star Hotel",
      "Burj Khalifa Tickets",
      "Desert Safari",
      "Airport Transfers",
    ],
    exclusions: ["Flights", "Visa fees", "Personal shopping"],
    itinerary: [
      {
        day: 1,
        title: "Arrival",
        description: "Arrive and enjoy Dhow Cruise.",
        activities: ["Dhow Cruise"],
      },
    ],
    isActive: true,
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
    imageUrl:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800",
    ],
    description: "Escape to crystal-clear waters and overwater villas.",
    highlights: [
      "Overwater Villa",
      "Snorkeling",
      "Sunset Cruise",
      "Spa Treatment",
    ],
    inclusions: [
      "Overwater Villa",
      "All Meals",
      "Speedboat Transfers",
      "Water Sports",
    ],
    exclusions: ["Flights", "Alcoholic beverages"],
    itinerary: [
      {
        day: 1,
        title: "Island Arrival",
        description: "Speedboat transfer to resort.",
        activities: ["Welcome Drink"],
      },
    ],
    isActive: true,
  },
  {
    title: "Swiss Alps Adventure",
    destination: "Switzerland",
    country: "Switzerland",
    category: "adventure",
    price: 1899,
    duration: "7 Days / 6 Nights",
    rating: 4.8,
    reviewCount: 156,
    imageUrl:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800",
    ],
    description: "Experience majestic Swiss Alps with scenic train rides.",
    highlights: [
      "Jungfraujoch",
      "Glacier Express",
      "Swiss Chocolate Tour",
      "Lake Geneva",
    ],
    inclusions: [
      "4-Star Hotels",
      "Swiss Travel Pass",
      "Guided Tours",
      "Breakfast Daily",
    ],
    exclusions: ["Flights", "Visa", "Lunch & Dinner"],
    itinerary: [
      {
        day: 1,
        title: "Zurich Arrival",
        description: "Explore old town.",
        activities: ["City Walk"],
      },
    ],
    isActive: true,
  },
  {
    title: "Bali Wellness Escape",
    destination: "Bali",
    country: "Indonesia",
    category: "wellness",
    price: 799,
    duration: "6 Days / 5 Nights",
    rating: 4.7,
    reviewCount: 198,
    imageUrl:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800",
    ],
    description:
      "Rejuvenate with yoga retreats, spa treatments in beautiful Bali.",
    highlights: [
      "Ubud Rice Terraces",
      "Yoga Retreat",
      "Temple Tours",
      "Balinese Spa",
    ],
    inclusions: [
      "Boutique Villa",
      "Daily Yoga Sessions",
      "Spa Treatments",
      "Cooking Class",
    ],
    exclusions: ["Flights", "Visa on Arrival"],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Ubud",
        description: "Transfer to villa.",
        activities: ["Welcome Ritual"],
      },
    ],
    isActive: true,
  },
];

const sampleUsers = [
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+919876543210",
    onboardingComplete: true,
  },
  {
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+919876543211",
    onboardingComplete: true,
  },
  {
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    phone: "+919876543212",
    onboardingComplete: true,
  },
];

const bookingStatuses = [
  "pending_payment",
  "processing",
  "documents_verified",
  "visa_submitted",
  "ready_to_fly",
];
const paymentStatuses = ["pending", "paid", "paid", "paid", "paid"];

async function seedDemoData() {
  console.log("🚀 Starting Production Demo Seed...\n");

  if (!PROJECT_ID || !API_KEY) {
    console.error("❌ Missing PROJECT_ID or API_KEY.");
    process.exit(1);
  }

  const createdPackageIds: string[] = [];
  const createdUserIds: string[] = [];

  // ============ SEED PACKAGES ============
  console.log("📦 Seeding Packages...");
  for (const pkg of samplePackages) {
    try {
      const payload = { ...pkg, itinerary: JSON.stringify(pkg.itinerary) };
      const row = await tables.createRow(
        DATABASE_ID,
        "packages",
        ID.unique(),
        payload
      );
      createdPackageIds.push(row.$id);
      console.log(`  ✅ ${pkg.title}`);
    } catch (error: any) {
      console.error(`  ❌ ${pkg.title}: ${error.message}`);
    }
  }

  // ============ SEED USERS ============
  console.log("\n👤 Seeding User Profiles...");
  for (const user of sampleUsers) {
    try {
      const userId = ID.unique();
      await tables.createRow(DATABASE_ID, "users", userId, user);
      createdUserIds.push(userId);
      console.log(`  ✅ ${user.name}`);
    } catch (error: any) {
      console.error(`  ❌ ${user.name}: ${error.message}`);
    }
  }

  // ============ SEED BOOKINGS ============
  console.log("\n📋 Seeding Bookings...");
  const bookingPackageNames = [
    "Kerala Backwater Bliss",
    "Dubai Luxury Escape",
    "Maldives Paradise Retreat",
    "Swiss Alps Adventure",
    "Bali Wellness Escape",
  ];

  for (let i = 0; i < 5; i++) {
    const userIdx = i % createdUserIds.length;
    const userId = createdUserIds[userIdx] || `demo_user_${i}`;

    const dept = new Date();
    dept.setDate(dept.getDate() + (i + 1) * 7);
    const ret = new Date(dept);
    ret.setDate(ret.getDate() + 5);

    const booking = {
      userId,
      packageId: createdPackageIds[i] || `demo_pkg_${i}`,
      packageTitle: bookingPackageNames[i],
      packageName: bookingPackageNames[i],
      destination: samplePackages[i].destination,
      departureDate: dept.toISOString(),
      returnDate: ret.toISOString(),
      adultsCount: 2,
      childrenCount: 0,
      infantsCount: 0,
      totalPrice: samplePackages[i].price * 2,
      status: bookingStatuses[i],
      statusHistory: JSON.stringify([
        {
          status: bookingStatuses[i],
          date: new Date().toISOString(),
          note: "Booking created",
        },
      ]),
      paymentStatus: paymentStatuses[i],
      travelers: JSON.stringify([
        {
          name: sampleUsers[userIdx]?.name || "Guest",
          age: 30,
          gender: "Male",
        },
        { name: "Companion", age: 28, gender: "Female" },
      ]),
      contactName: sampleUsers[userIdx]?.name || "Guest",
    };

    try {
      await tables.createRow(DATABASE_ID, "bookings", ID.unique(), booking);
      console.log(
        `  ✅ Booking for ${booking.packageTitle} (${booking.status})`
      );
    } catch (error: any) {
      console.error(`  ❌ Booking ${i + 1}: ${error.message}`);
    }
  }

  // ============ SEED CONSULTATIONS ============
  console.log("\n💬 Seeding Consultations...");
  const consultationData = [
    {
      type: "plan_trip",
      notes: "Destination: Japan, Travelers: 4, Budget: $5000",
      destination: "Japan",
    },
    {
      type: "visa_help",
      notes: "Passport: India, Destination: Schengen",
      destination: "France",
    },
    {
      type: "flights",
      notes: "Route: Delhi to Paris, Class: Business",
      destination: "Paris",
    },
    {
      type: "insurance",
      notes: "Trip Type: Multi-trip, Region: Worldwide",
      destination: "Worldwide",
    },
  ];

  for (let i = 0; i < consultationData.length; i++) {
    const userIdx = i % createdUserIds.length;
    const consultation = {
      userId: createdUserIds[userIdx] || `demo_user_${i}`,
      userName: sampleUsers[userIdx]?.name || "Guest User",
      userPhone: sampleUsers[userIdx]?.phone || "+910000000000",
      userEmail: sampleUsers[userIdx]?.email,
      type: consultationData[i].type,
      destination: consultationData[i].destination,
      notes: consultationData[i].notes,
      status: i < 2 ? "new" : "contacted",
    };

    try {
      await tables.createRow(
        DATABASE_ID,
        "consultations",
        ID.unique(),
        consultation
      );
      console.log(`  ✅ ${consultation.type} consultation`);
    } catch (error: any) {
      console.error(`  ❌ Consultation ${i + 1}: ${error.message}`);
    }
  }

  // ============ SEED CHAT MESSAGES ============
  console.log("\n💭 Seeding Chat Messages...");
  if (createdUserIds[0]) {
    const conversationId = `${createdUserIds[0]}_admin`;
    const messages = [
      {
        senderId: createdUserIds[0],
        senderName: sampleUsers[0].name,
        content: "Hi, I need help planning a trip to Europe.",
        read: true,
      },
      {
        senderId: "admin",
        senderName: "Support Agent",
        content: "Hello! I'd be happy to help. What countries interest you?",
        read: true,
      },
      {
        senderId: createdUserIds[0],
        senderName: sampleUsers[0].name,
        content: "I'm thinking Switzerland and France for 10 days.",
        read: true,
      },
      {
        senderId: "admin",
        senderName: "Support Agent",
        content: "Great choices! Our Swiss Alps Adventure package is perfect.",
        read: false,
      },
    ];

    for (const msg of messages) {
      try {
        await tables.createRow(DATABASE_ID, "messages", ID.unique(), {
          conversationId,
          ...msg,
        });
      } catch (error: any) {
        console.error(`  ❌ Message: ${error.message}`);
      }
    }
    console.log(`  ✅ Created chat with ${messages.length} messages`);
  }

  console.log("\n🎉 Production Demo Seed Complete!");
  console.log(`   📦 ${createdPackageIds.length} Packages`);
  console.log(`   👤 ${createdUserIds.length} Users`);
  console.log(`   📋 5 Bookings`);
  console.log(`   💬 4 Consultations`);
  console.log(`   💭 1 Chat Conversation`);
}

seedDemoData();
