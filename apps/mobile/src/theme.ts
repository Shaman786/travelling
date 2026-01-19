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

// Core Color Palette - Refreshed with vibrant modern tones
export const colors = {
  // Primary - Vibrant Blue (Matches Hero Gradient)
  primary: "#2563EB", // Blue 600 - Dynamic & Trustworthy
  primaryLight: "#60A5FA", // Blue 400
  primaryDark: "#1E40AF", // Blue 800

  // Accent - Warm Orange (Highlights)
  accent: "#F59E0B", // Amber 500
  accentLight: "#FCD34D", // Amber 300
  accentDark: "#B45309", // Amber 700

  // Secondary Accents
  teal: "#14B8A6", // Teal 500
  coral: "#F43F5E", // Rose 500

  // Background & Surface
  background: "#FFFFFF",
  surface: "#F8FAFC", // Slate 50
  surfaceVariant: "#F1F5F9", // Slate 100
  surfaceElevated: "#FFFFFF",

  // Status Colors
  success: "#10B981", // Emerald 500
  warning: "#F59E0B", // Amber 500
  error: "#EF4444", // Red 500
  info: "#3B82F6", // Blue 500

  // Text Colors
  textPrimary: "#0F172A", // Slate 900
  textSecondary: "#475569", // Slate 600
  textMuted: "#94A3B8", // Slate 400
  textInverse: "#FFFFFF",

  // Destination Theme Colors
  india: "#F97316", // Orange 500
  gulf: "#EAB308", // Yellow 500
  uk: "#2563EB", // Blue 600
  usa: "#DC2626", // Red 600

  // Booking Status Colors
  processing: "#F59E0B",
  visaApproved: "#10B981",
  readyToFly: "#3B82F6",
  completed: "#8B5CF6",

  // Enhanced Glass/Blur Effects
  glassBorder: "rgba(255, 255, 255, 0.2)",
  glassSurface: "rgba(255, 255, 255, 0.75)",
  glassOverlay: "rgba(15, 23, 42, 0.6)", // Slate 900 with opacity

  // Gradient Presets
  gradientSunrise: ["#F59E0B", "#EF4444"],
  gradientOcean: ["#3B82F6", "#0EA5E9"],
  gradientSunset: ["#F43F5E", "#F59E0B"],
  gradientForest: ["#10B981", "#34D399"],
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
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

// Typography - Enhanced hierarchy
export const typography = {
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semibold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    display: "Outfit_700Bold",
    displayMedium: "Outfit_500Medium",
    displayRegular: "Outfit_400Regular",
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
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: {
      fontFamily: "Outfit_700Bold",
      fontWeight: "700",
      fontSize: 57,
      lineHeight: 64,
      letterSpacing: 0,
    },
    displayMedium: {
      fontFamily: "Outfit_700Bold",
      fontWeight: "700",
      fontSize: 45,
      lineHeight: 52,
      letterSpacing: 0,
    },
    displaySmall: {
      fontFamily: "Outfit_700Bold",
      fontWeight: "700",
      fontSize: 36,
      lineHeight: 44,
      letterSpacing: 0,
    },
    headlineLarge: {
      fontFamily: "Outfit_700Bold",
      fontWeight: "700",
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: 0,
    },
    headlineMedium: {
      fontFamily: "Outfit_500Medium",
      fontWeight: "500",
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    },
    headlineSmall: {
      fontFamily: "Outfit_400Regular",
      fontWeight: "400",
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
    },
    titleLarge: {
      fontFamily: "Outfit_500Medium",
      fontWeight: "500",
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 0,
    },
    titleMedium: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelLarge: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    bodyLarge: {
      fontFamily: "Inter_400Regular",
      fontWeight: "400",
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    bodyMedium: {
      fontFamily: "Inter_400Regular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontFamily: "Inter_400Regular",
      fontWeight: "400",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.4,
    },
  } as any,
};

// React Native Paper Dark Theme
// React Native Paper Dark Theme - High Contrast
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#60A5FA", // Blue 400 - High brightness for dark mode
    primaryContainer: "#1E40AF", // Blue 800
    secondary: "#FBBF24", // Amber 400
    secondaryContainer: "#B45309", // Amber 700
    tertiary: "#2DD4BF", // Teal 400
    background: "#0F172A", // Slate 900 - Rich dark background
    surface: "#1E293B", // Slate 800
    surfaceVariant: "#334155", // Slate 700
    error: "#F87171", // Red 400
    onPrimary: "#FFFFFF", // White on Blue
    onSecondary: "#0F172A", // Dark on Amber
    onBackground: "#F1F5F9", // Slate 100
    onSurface: "#F1F5F9", // Slate 100
    onSurfaceVariant: "#94A3B8", // Slate 400
    outline: "#64748B", // Slate 500
    elevation: {
      level0: "transparent",
      level1: "#272727",
      level2: "#2C2C2C",
      level3: "#333333",
      level4: "#383838",
      level5: "#3F3F3F",
    },
  },
  roundness: borderRadius.md,
  fonts: {
    ...MD3DarkTheme.fonts,
    displayLarge: {
      fontFamily: "Outfit_700Bold",
      fontWeight: "700",
      fontSize: 57,
      lineHeight: 64,
      letterSpacing: 0,
    },
    displayMedium: {
      fontFamily: "Outfit_700Bold",
      fontWeight: "700",
      fontSize: 45,
      lineHeight: 52,
      letterSpacing: 0,
    },
    displaySmall: {
      fontFamily: "Outfit_700Bold",
      fontWeight: "700",
      fontSize: 36,
      lineHeight: 44,
      letterSpacing: 0,
    },
    headlineLarge: {
      fontFamily: "Outfit_700Bold",
      fontWeight: "700",
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: 0,
    },
    headlineMedium: {
      fontFamily: "Outfit_500Medium",
      fontWeight: "500",
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    },
    headlineSmall: {
      fontFamily: "Outfit_400Regular",
      fontWeight: "400",
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
    },
    titleLarge: {
      fontFamily: "Outfit_500Medium",
      fontWeight: "500",
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: 0,
    },
    titleMedium: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "600",
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    titleSmall: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    labelLarge: {
      fontFamily: "Inter_600SemiBold",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
    },
    bodyLarge: {
      fontFamily: "Inter_400Regular",
      fontWeight: "400",
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.15,
    },
    bodyMedium: {
      fontFamily: "Inter_400Regular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.25,
    },
    bodySmall: {
      fontFamily: "Inter_400Regular",
      fontWeight: "400",
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.4,
    },
  } as any,
};

// Export default theme
export const theme = lightTheme;
