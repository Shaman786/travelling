/**
 * Host-Palace Travel App Theme
 *
 * UI Overhaul v2.0 - Inspired by modern travel app aesthetics
 *
 * Platform-Adaptive Design System:
 * - Android: Material Design 3 (Material You)
 * - iOS: Liquid Glass (Human Interface Guidelines)
 */

import { Platform, ViewStyle } from "react-native";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Core Color Palette - Refreshed with warm orange accent
export const colors = {
  // Primary - Deep Blue (Trustworthy, Professional)
  primary: "#0056D2",
  primaryLight: "#4A8FE7",
  primaryDark: "#003B8E",

  // Accent - Warm Orange (Energetic, Travel Vibes) - Updated!
  accent: "#F5A623",
  accentLight: "#FFD180",
  accentDark: "#E09000",

  // Secondary Accents
  teal: "#00BFA5", // For success states, bookings
  coral: "#FF6B6B", // For favorites, hearts

  // Background & Surface - Lighter, airier feel
  background: "#FAFBFC",
  surface: "#FFFFFF",
  surfaceVariant: "#F3F5F7",
  surfaceElevated: "#FFFFFF",

  // Status Colors
  success: "#10B981", // Emerald green
  warning: "#F59E0B", // Amber
  error: "#EF4444", // Red
  info: "#3B82F6", // Blue

  // Text Colors
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Destination Theme Colors
  india: "#FF9933", // Saffron
  gulf: "#C5A572", // Golden Sand
  uk: "#012169", // British Blue
  usa: "#3C3B6E", // American Blue

  // Booking Status Colors
  processing: "#F59E0B",
  visaApproved: "#10B981",
  readyToFly: "#3B82F6",
  completed: "#8B5CF6",

  // Enhanced Glass/Blur Effects
  glassBorder: "rgba(255, 255, 255, 0.3)",
  glassSurface: "rgba(255, 255, 255, 0.85)",
  glassOverlay: "rgba(0, 0, 0, 0.4)",

  // Gradient Presets
  gradientSunrise: ["#FF9500", "#FF5E3A"],
  gradientOcean: ["#0056D2", "#00A8FF"],
  gradientSunset: ["#FF6B6B", "#FF9F43"],
  gradientForest: ["#10B981", "#059669"],
};

// Spacing & Sizing - More generous for airy feel
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Platform-Adaptive Border Radius - More rounded for modern feel
export const borderRadius = {
  xs: 6,
  sm: Platform.OS === "ios" ? 12 : 10,
  md: Platform.OS === "ios" ? 18 : 14,
  lg: Platform.OS === "ios" ? 24 : 20,
  xl: Platform.OS === "ios" ? 32 : 28,
  full: 9999,
};

// Typography - Enhanced hierarchy
export const typography = {
  fontFamily: {
    regular: Platform.OS === "ios" ? "System" : "Roboto",
    medium: Platform.OS === "ios" ? "System" : "Roboto-Medium",
    semibold: Platform.OS === "ios" ? "System" : "Roboto-Medium",
    bold: Platform.OS === "ios" ? "System" : "Roboto-Bold",
  },
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    hero: 36,
    display: 44,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Shadow presets - Platform Adaptive, softer look
export const shadows = {
  xs: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),
  sm: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: {
      elevation: 8,
    },
  }),
  xl: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 32,
    },
    android: {
      elevation: 12,
    },
  }),
  // Colored shadows for accent elements
  accent: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }),
  primary: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    android: {
      elevation: 6,
    },
  }),
};

// Glassmorphism Utilities (iOS)
export const glassStyle: ViewStyle =
  Platform.OS === "ios"
    ? {
        backgroundColor: colors.glassSurface,
        borderColor: colors.glassBorder,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      }
    : {
        backgroundColor: colors.surface,
        elevation: 4,
      };

// Animation Presets
export const animations = {
  spring: {
    damping: 15,
    stiffness: 400,
  },
  springGentle: {
    damping: 20,
    stiffness: 300,
  },
  springBouncy: {
    damping: 12,
    stiffness: 500,
  },
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

// React Native Paper Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.accent,
    secondaryContainer: colors.accentLight,
    tertiary: colors.teal,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    error: colors.error,
    onPrimary: colors.textInverse,
    onSecondary: colors.textPrimary,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.textMuted,
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#FAFBFC",
      level3: "#F7F8FA",
      level4: "#F3F5F7",
      level5: "#EFF1F3",
    },
  },
  roundness: borderRadius.md,
};

// React Native Paper Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    primaryContainer: colors.primary,
    secondary: colors.accent,
    secondaryContainer: colors.accentDark,
    tertiary: colors.teal,
    background: "#0F0F14",
    surface: "#1A1A24",
    surfaceVariant: "#252532",
    error: colors.error,
    onPrimary: colors.textPrimary,
    onSecondary: colors.textPrimary,
    onBackground: colors.textInverse,
    onSurface: colors.textInverse,
    onSurfaceVariant: colors.textMuted,
    outline: "#4A4A5A",
  },
  roundness: borderRadius.md,
};

// Export default theme
export const theme = lightTheme;
