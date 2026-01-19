/**
 * TwoToneHeadline Component
 *
 * Creates a headline with one word highlighted in accent color.
 * Example: "Explore Amazing **Destinations**"
 */

import React from "react";
import { Text as RNText, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { typography } from "../../theme";

interface TwoToneHeadlineProps {
  /** Text before the highlighted word */
  prefix?: string;
  /** The word to highlight in accent color */
  highlight: string;
  /** Text after the highlighted word (optional) */
  suffix?: string;
  /** Size variant */
  size?: "small" | "medium" | "large";
  /** Custom accent color (defaults to theme accent) */
  accentColor?: string;
  /** Center the text */
  centered?: boolean;
}

export default function TwoToneHeadline({
  prefix = "",
  highlight,
  suffix = "",
  size = "medium",
  accentColor,
  centered = false,
}: TwoToneHeadlineProps) {
  const theme = useTheme();
  // Default accent from theme if not provided
  const effectiveAccent = accentColor || theme.colors.secondary;
  const fontSize = {
    small: typography.sizes.xl,
    medium: typography.sizes.xxl,
    large: typography.sizes.hero,
  }[size];

  return (
    <View style={[styles.container, centered && styles.centered]}>
      <RNText
        style={[
          styles.headline,
          { fontSize, color: theme.colors.onBackground },
        ]}
      >
        {prefix && `${prefix} `}
        <RNText
          style={[styles.highlight, { color: effectiveAccent, fontSize }]}
        >
          {highlight}
        </RNText>
        {suffix && ` ${suffix}`}
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  centered: {
    alignItems: "center",
  },
  headline: {
    fontWeight: "bold",
    lineHeight: 40,
  },
  highlight: {
    fontWeight: "bold",
  },
});
