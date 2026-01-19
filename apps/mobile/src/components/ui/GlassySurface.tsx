// GlassSurface Component - Force Lint Refresh
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, View, ViewProps } from "react-native";
import { useTheme } from "react-native-paper";

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
export const GlassSurface: React.FC<GlassSurfaceProps> = (props) => {
  const { intensity = 50, style, children, ...restProps } = props;

  const theme = useTheme();

  // Android Fallback (BlurView doesn't work well on Android)
  if (Platform.OS === "android") {
    return (
      <View
        style={[
          styles.androidSurface,
          {
            backgroundColor: theme.dark
              ? "rgba(30,30,30,0.9)"
              : "rgba(255, 255, 255, 0.9)",
            borderColor: theme.dark
              ? "rgba(255,255,255,0.1)"
              : "rgba(255, 255, 255, 0.2)",
          },
          style,
        ]}
        {...restProps}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={intensity}
      tint={theme.dark ? "dark" : "light"}
      style={[styles.iosGlass, style]}
      {...restProps}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  iosGlass: {
    overflow: "hidden",
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  },
  androidSurface: {
    borderWidth: 1,
    overflow: "hidden",
  },
});
