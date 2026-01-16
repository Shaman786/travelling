/**
 * Commercial Travel App Theme
 *
 * Platform-Adaptive Design System:
 * - Android: Material Design 3 (Material You)
 * - iOS: Liquid Glass (Human Interface Guidelines)
 */

import { Platform, ViewStyle } from "react-native";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// Core Color Palette
export const colors = {
  // Primary - Deep Blue (Trustworthy, Professional)
  primary: "#0056D2",
  primaryLight: "#4A8FE7",
  primaryDark: "#003B8E",

  // Accent - Gold (Premium, Consultancy Feel)
  accent: "#FFC107",
  accentLight: "#FFD54F",
  accentDark: "#FFA000",

  // Background & Surface
  background: "#F5F7FA",
  surface: "#FFFFFF",
  surfaceVariant: "#EEF2F6",

  // Status Colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",

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
  processing: "#FF9800",
  visaApproved: "#4CAF50",
  readyToFly: "#2196F3",
  completed: "#9C27B0",

  // iOS Specific (Liquid Glass)
  glassBorder: "rgba(255, 255, 255, 0.2)",
  glassSurface: "rgba(255, 255, 255, 0.7)",
};

// Spacing & Sizing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Platform-Adaptive Border Radius
export const borderRadius = {
  sm: Platform.OS === "ios" ? 10 : 8,
  md: Platform.OS === "ios" ? 16 : 12,
  lg: Platform.OS === "ios" ? 24 : 16,
  xl: Platform.OS === "ios" ? 32 : 24,
  full: 9999,
};

// Typography
export const typography = {
  fontFamily: {
    regular: Platform.OS === "ios" ? "System" : "Roboto",
    medium: Platform.OS === "ios" ? "System" : "Roboto-Medium",
    bold: Platform.OS === "ios" ? "System" : "Roboto-Bold",
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    hero: 40,
  },
};

// Shadow presets - Platform Adaptive
export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
    },
    android: {
      elevation: 8,
    },
  }),
};

// Glassmorphism Utilities (iOS)
// Glassmorphism Utilities (iOS)
// NOTE: Prefer using <GlassSurface /> component for real blur.
export const glassStyle: ViewStyle =
  Platform.OS === "ios"
    ? {
        // Fallback or lightweight usage where component isn't possible
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      }
    : {}; // Android relies on elevation/surfaces normally

// React Native Paper Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.accent,
    secondaryContainer: colors.accentLight,
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    error: colors.error,
    onPrimary: colors.textInverse,
    onSecondary: colors.textPrimary,
    onBackground: colors.textPrimary,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    elevation: {
      level0: "transparent",
      level1: "#FFFFFF",
      level2: "#F7F9FC",
      level3: "#F5F7FA",
      level4: "#F0F4F8",
      level5: "#EBEEF2",
    },
  },
  roundness: borderRadius.md,
};

// React Native Paper Dark Theme (for future use)
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primaryLight,
    primaryContainer: colors.primary,
    secondary: colors.accent,
    secondaryContainer: colors.accentDark,
    background: "#121212",
    surface: "#1E1E1E",
    surfaceVariant: "#2C2C2C",
    error: colors.error,
    onPrimary: colors.textPrimary,
    onSecondary: colors.textPrimary,
    onBackground: colors.textInverse,
    onSurface: colors.textInverse,
    onSurfaceVariant: colors.textMuted,
  },
  roundness: borderRadius.md,
};

// Export default theme
export const theme = lightTheme;
