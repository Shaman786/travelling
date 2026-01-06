/**
 * Mock Data for Travelling App
 * 
 * Includes:
 * - Destinations (India, Gulf, UK, USA)
 * - Travel Packages
 * - Itinerary Details
 */

export interface DailyItinerary {
  day: number;
  title: string;
  description: string;
  activities: string[];
  image: string; // Unsplash URL
}

export interface TravelPackage {
  id: string;
  destinationId: string;
  title: string;
  description: string;
  base_price: number;
  discounted_price?: number;
  rating: number;
  reviewCount: number;
  duration_days: number;
  image: string; // Unsplash URL
  images: string[];
  inclusions: string[];
  itinerary: DailyItinerary[];
  region: "India" | "Gulf" | "UK" | "USA" | "Europe" | "Asia";
  featured: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
  icon: string; // vector-icon name
}

// Categories / Regions
export const categories: Category[] = [
  { 
    id: "india", 
    name: "India", 
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=600&auto=format&fit=crop",
    icon: "home-variant"
  },
  { 
    id: "gulf", 
    name: "Gulf", 
    image: "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=600&auto=format&fit=crop",
    icon: "palm-tree"
  },
  { 
    id: "uk", 
    name: "UK & Europe", 
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=600&auto=format&fit=crop",
    icon: "castle"
  },
  { 
    id: "usa", 
    name: "USA", 
    image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=600&auto=format&fit=crop",
    icon: "flag-variant"
  },
];

// Mock Packages
export const packages: TravelPackage[] = [
  // --- INDIA PACKAGES ---
  {
    id: "pkg_kerala_bliss",
    destinationId: "india",
    title: "Kerala Backwater Bliss",
    description: "Experience the serene backwaters, tea plantations of Munnar, and the pristine beaches of Kovalam in this comprehensive Kerala tour.",
    base_price: 450,
    discounted_price: 399,
    rating: 4.8,
    reviewCount: 124,
    duration_days: 6,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop", // Houseboat
      "https://images.unsplash.com/photo-1596325067464-f6eb73f00994?q=80&w=800&auto=format&fit=crop", // Munnar
      "https://images.unsplash.com/photo-1590050752117-238cb0fb9dbb?q=80&w=800&auto=format&fit=crop", // Kathakali
    ],
    region: "India",
    featured: true,
    tags: ["Nature", "Relaxation", "Houseboat"],
    inclusions: ["Airport Transfers", "Houseboat Stay", "Breakfast & Dinner", "Sightseeing Cabs", "Munnar Tea Museum Entry"],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Cochin & Transfer to Munnar",
        description: "Arrive at Cochin Airport where our representative will meet you. Proceed to Munnar (4 hrs drive), enjoying the scenic waterfalls like Cheeyappara along the way.",
        activities: ["Cheeyappara Waterfalls", "Valara Waterfalls", "Hotel Check-in"],
        image: "https://images.unsplash.com/photo-1596325067464-f6eb73f00994?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 2,
        title: "Munnar Sightseeing",
        description: "Full day sightseeing in Munnar. Visit the Tea Museum, Mattupetty Dam, and Eco Point. Evening at leisure.",
        activities: ["Tea Museum", "Mattupetty Dam", "Eco Point", "Kundala Lake"],
        image: "https://images.unsplash.com/photo-1616056037887-a36c61f23555?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 3,
        title: "Thekkady Wildlife",
        description: "Drive to Thekkady (3 hrs). Visit the Periyar National Park. Optional elephant ride and spice plantation tour.",
        activities: ["Periyar Lake Boat Ride", "Spice Plantation Tour", "Kathakali Performance"],
        image: "https://images.unsplash.com/photo-1555845542-a28d546059c1?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 4,
        title: "Alleppey Houseboat Stay",
        description: "Proceed to Alleppey for the highlight of the trip - a stay in a traditional Kerala houseboat. Cruise through the backwaters.",
        activities: ["Houseboat Check-in", "Backwater Cruise", "Traditional Kerala Lunch"],
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 5,
        title: "Kovalam Beach",
        description: "Disembark from houseboat and drive to Kovalam. Relax on the crescent-shaped beaches.",
        activities: ["Lighthouse Beach", "Hawa Beach", "Samudra Beach"],
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 6,
        title: "Departure from Trivandrum",
        description: "Transfer to Trivandrum Airport for your onward journey with beautiful memories.",
        activities: ["Padmanabhaswamy Temple (Optional)", "Airport Drop"],
        image: "https://images.unsplash.com/photo-1621065796788-29a39775f044?q=80&w=800&auto=format&fit=crop"
      }
    ]
  },
  {
    id: "pkg_gold_triangle",
    destinationId: "india",
    title: "Golden Triangle Royal Tour",
    description: "Explore the cultural heritage of India with the classic Golden Triangle circuit - Delhi, Agra, and Jaipur.",
    base_price: 550,
    rating: 4.7,
    reviewCount: 210,
    duration_days: 5,
    image: "https://images.unsplash.com/photo-1564659130709-2c764493e06c?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1564659130709-2c764493e06c?q=80&w=800&auto=format&fit=crop", // Taj Mahal
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop", // Hawa Mahal
      "https://images.unsplash.com/photo-1587474265402-9e2b74feaa5a?q=80&w=800&auto=format&fit=crop", // India Gate
    ],
    region: "India",
    featured: false,
    tags: ["Culture", "History", "Luxury"],
    inclusions: ["5-Star Hotels", "Private Chauffeur", "Monument Entries", "Guide Services"],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Delhi",
        description: "Arrive in New Delhi. Visit Qutub Minar, Humayun's Tomb and India Gate.",
        activities: ["Qutub Minar", "India Gate", "Lotus Temple"],
        image: "https://images.unsplash.com/photo-1587474265402-9e2b74feaa5a?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 2,
        title: "Delhi to Agra",
        description: "Drive to Agra (3 hrs). Visit the majestic Taj Mahal at sunset.",
        activities: ["Agra Fort", "Taj Mahal Sunset View"],
        image: "https://images.unsplash.com/photo-1564659130709-2c764493e06c?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 3,
        title: "Agra to Jaipur",
        description: "Proceed to Jaipur via Fatehpur Sikri. Evening exploration of local markets.",
        activities: ["Fatehpur Sikri", "Check-in Jaipur", "Johari Bazaar"],
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 4,
        title: "Pink City Sightseeing",
        description: "Full day tour of Jaipur. Visit Amber Fort with jeep ride, City Palace and Hawa Mahal.",
        activities: ["Amber Fort", "Hawa Mahal", "Jantar Mantar", "City Palace"],
        image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 5,
        title: "Departure",
        description: "Drive back to Delhi for your departure flight.",
        activities: ["Shopping", "Airport Transfer"],
        image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=800&auto=format&fit=crop"
      }
    ]
  },

  // --- GULF PACKAGES ---
  {
    id: "pkg_dubai_luxury",
    destinationId: "gulf",
    title: "Dubai Luxury Escape",
    description: "Witness the glitz and glamour of Dubai. From the heights of Burj Khalifa to the depths of the ocean at Atlantis.",
    base_price: 899,
    discounted_price: 849,
    rating: 4.9,
    reviewCount: 340,
    duration_days: 5,
    image: "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1512453979798-5ea904ac66de?q=80&w=800&auto=format&fit=crop", // Burj Khalifa
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=800&auto=format&fit=crop", // Desert Safari
      "https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?q=80&w=800&auto=format&fit=crop", // Marina
    ],
    region: "Gulf",
    featured: true,
    tags: ["Shopping", "Luxury", "Adventure"],
    inclusions: ["Burj Khalifa Tickets", "Desert Safari with BBQ", "Dhow Cruise", "Visa Assistance"],
    itinerary: [
      {
        day: 1,
        title: "Arrival & Dhow Cruise",
        description: "Arrive at Dubai International Airport. Evening Dhow Cruise with dinner on Dubai Creek.",
        activities: ["Airport Transfer", "Dhow Cruise Dinner"],
        image: "https://images.unsplash.com/photo-1578347898863-7185013be825?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 2,
        title: "City Tour & Burj Khalifa",
        description: "Half-day city tour. Evening visit to the 124th floor of Burj Khalifa to see the fountains from above.",
        activities: ["Dubai Mall", "Burj Khalifa", "Dubai Fountain"],
        image: "https://images.unsplash.com/photo-1496568813655-bbe21650e4b7?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 3,
        title: "Desert Safari",
        description: "Morning at leisure. Afternoon 4x4 Desert Safari with dune bashing, camel riding, and BBQ dinner.",
        activities: ["Dune Bashing", "Camel Ride", "Belly Dance Show", "BBQ Dinner"],
        image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 4,
        title: "Abu Dhabi Day Trip",
        description: "Full day tour to Abu Dhabi. Visit the Grand Mosque and Ferrari World.",
        activities: ["Sheikh Zayed Grand Mosque", "Ferrari World/Yas Waterworld"],
        image: "https://images.unsplash.com/photo-1519967727145-2e1bb49a7161?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 5,
        title: "Shopping & Departure",
        description: "Last minute shopping at the Souks before heading to the airport.",
        activities: ["Gold Souk", "Spice Souk", "Airport Transfer"],
        image: "https://images.unsplash.com/photo-1577100067083-7c38dd8439ae?q=80&w=800&auto=format&fit=crop"
      }
    ]
  },

  // --- UK PACKAGES ---
  {
    id: "pkg_london_scotland",
    destinationId: "uk",
    title: "London & Scottish Highlands",
    description: "A journey through the royal history of London to the breathtaking landscapes of Scotland.",
    base_price: 1200,
    rating: 4.6,
    reviewCount: 95,
    duration_days: 8,
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop", // Big Ben
      "https://images.unsplash.com/photo-1506377550980-bc8296f4dc66?q=80&w=800&auto=format&fit=crop", // Scotland
      "https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=800&auto=format&fit=crop", // Tower Bridge
    ],
    region: "UK",
    featured: false,
    tags: ["History", "Nature", "Scenic"],
    inclusions: ["London Eye Tickets", "Train to Edinburgh", "Highlands Tour", "Breakfast Daily"],
    itinerary: [
      {
        day: 1,
        title: "Hello London",
        description: "Arrival in London. Check in to your central hotel.",
        activities: ["Airport Transfer", "Leisure Walk"],
        image: "https://images.unsplash.com/photo-1533929736472-11429405e214?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 2,
        title: "London Essentials",
        description: "Hop-on Hop-off tour. Visit Buckingham Palace and Westminster Abbey.",
        activities: ["Buckingham Palace", "Big Ben", "London Eye"],
        image: "https://images.unsplash.com/photo-1529180184518-a53e93655df5?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 3,
        title: "Train to Edinburgh",
        description: "Scenic train journey to Edinburgh, Scotland. Explore the Royal Mile.",
        activities: ["Train Ride", "Royal Mile", "Edinburgh Castle"],
        image: "https://images.unsplash.com/photo-1498338763717-8051df52e1b5?q=80&w=800&auto=format&fit=crop"
      },
      {
        day: 4,
        title: "Loch Ness & Highlands",
        description: "Full day tour to the Scottish Highlands and Loch Ness.",
        activities: ["Glencoe", "Loch Ness Cruise", "Highlands Scenery"],
        image: "https://images.unsplash.com/photo-1506377550980-bc8296f4dc66?q=80&w=800&auto=format&fit=crop"
      }
    ]
  },

  // --- USA PACKAGES ---
  {
    id: "pkg_nyc_florida",
    destinationId: "usa",
    title: "New York & Miami Sun",
    description: "The perfect mix of city life and beach vibes. From Times Square to South Beach.",
    base_price: 1500,
    rating: 4.8,
    reviewCount: 156,
    duration_days: 7,
    image: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=800&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=800&auto=format&fit=crop", // NYC
      "https://images.unsplash.com/photo-1535498730771-e735b998cd64?q=80&w=800&auto=format&fit=crop", // Miami
    ],
    region: "USA",
    featured: true,
    tags: ["City", "Beach", "Nightlife"],
    inclusions: ["Domestic Flight", "City Pass NYC", "Everglades Tour", "Airport Transfers"],
    itinerary: [
      {
        day: 1,
        title: "Welcome to the Big Apple",
        description: "Arrive at JFK. Transfer to Manhattan hotel. Evening at Times Square.",
        activities: ["Times Square", "Broadway Show (Optional)"],
        image: "https://images.unsplash.com/photo-1534270804882-6b5048b1c1fc?q=80&w=800&auto=format&fit=crop"
      }
    ]
  }
];

// Helper functions to simulate API calls
export const getPackageById = (id: string) => packages.find((p) => p.id === id);
export const getPackagesByRegion = (region: string) => packages.filter((p) => p.region.toLowerCase() === region.toLowerCase());
export const getFeaturedPackages = () => packages.filter((p) => p.featured);
