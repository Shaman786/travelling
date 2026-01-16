import { BannerConfig } from "../types/banner";

// Mock Data
const MOCK_BANNERS: BannerConfig[] = [
  {
    id: "promo_bali_2026",
    type: "gradient",
    priority: 10,
    content: {
      title: "Bali Summer Getaway",
      subtitle: "Get 20% off on all packages booked this week!",
      // gradientColors: ["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"], // Uses default gradient in component if missing
      imageUrl: "https://picsum.photos/seed/promo/800/400",
    },
    action: {
      type: "navigate",
      value: "/curated",
    },
  },
  {
    id: "lottie_travel",
    type: "lottie",
    priority: 5,
    content: {
      title: "Explore the World",
      subtitle: "New destinations added every day.",
      // Using a reliable sample lottie json
      lottieSource:
        "https://lottie.host/8c13b35a-9359-4581-9f93-181156829774/jR7e4tO4q.json",
    },
    action: {
      type: "navigate",
      value: "/search",
    },
  },
];

class RemoteConfigService {
  async getBanners(): Promise<BannerConfig[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Sort by priority desc
    return MOCK_BANNERS.sort((a, b) => b.priority - a.priority);
  }

  async getFeaturedBanner(): Promise<BannerConfig | null> {
    const banners = await this.getBanners();
    return banners.length > 0 ? banners[0] : null;
  }
}

export const remoteConfig = new RemoteConfigService();
