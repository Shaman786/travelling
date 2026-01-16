import type { AnimationObject } from "lottie-react-native";

export interface BannerAction {
  type: "link" | "navigate";
  value: string;
}

export interface BannerContent {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  // strict type matching LottieView source prop
  lottieSource?: string | AnimationObject | { uri: string };
  gradientColors?: readonly [string, string, ...string[]];
}

export interface BannerConfig {
  id: string;
  type: "image" | "lottie" | "gradient";
  priority: number;
  content: BannerContent;
  action?: BannerAction;
  targeting?: {
    userTags?: string[];
    startDate?: string;
    endDate?: string;
  };
}
