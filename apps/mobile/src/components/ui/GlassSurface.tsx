import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, ViewProps } from "react-native";

interface GlassSurfaceProps extends ViewProps {
  intensity?: number;
}

/**
 * GlassSurface
 *
 * Platform-Adaptive Component:
 * - iOS: Uses `expo-blur` for real "Liquid Glass" effect.
 * - Android: Uses a semi-transparent surface (Material-safe) fallback to avoid performance issues/crashes.
 */
export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  intensity = 50,
  ...props
}) => {
  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={intensity}
        tint="light" // Standard liquid glass look
        style={[styles.iosGlass, style]}
        {...(props as any)}
      >
        {children}
      </BlurView>
    );
  }

  // Android Fallback: Clean, slightly translucent surface (Material-like)
  return (
    <View style={[styles.androidSurface, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  iosGlass: {
    backgroundColor: "rgba(255, 255, 255, 0.4)", // Additive white tint for "Liquid" feel
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
    overflow: "hidden",
  },
  androidSurface: {
    // High opacity to ensure readability without blur
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
  },
});
