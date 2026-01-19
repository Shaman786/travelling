import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassSurface } from "../ui/GlassySurface";

interface HeroSectionProps {
  userName: string;
  onNotificationPress: () => void;
  onSettingsPress?: () => void; // New prop
  unreadCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  userName,
  onNotificationPress,
  onSettingsPress,
  unreadCount = 0,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Dynamic gradient colors based on theme
  const gradientColors = theme.dark
    ? ["#1A237E", "#000000"] // Dark Blue to Black
    : ["#2196F3", "#E3F2FD"]; // Blue to Light Blue

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            paddingTop: insets.top,
            height: 280 + insets.top, // Taller hero for impact
          },
        ]}
      />

      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View>
            <Text
              variant="titleMedium"
              style={{
                color: theme.dark ? "#B3E5FC" : "#E3F2FD",
                opacity: 0.9,
              }}
            >
              Good Morning,
            </Text>
            <Text
              variant="headlineMedium"
              style={{
                color: theme.dark ? "#FFFFFF" : "#FFFFFF",
                fontWeight: "bold",
              }}
            >
              {userName} 👋
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={onNotificationPress}
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <GlassSurface intensity={20} style={styles.iconGlass}>
                <MaterialCommunityIcons
                  name={unreadCount > 0 ? "bell-badge-outline" : "bell-outline"}
                  size={24}
                  color="#FFFFFF"
                />
              </GlassSurface>
            </Pressable>

            {onSettingsPress && (
              <Pressable
                onPress={onSettingsPress}
                style={({ pressed }) => [
                  styles.iconButton,
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <GlassSurface intensity={20} style={styles.iconGlass}>
                  <MaterialCommunityIcons
                    name="cog-outline"
                    size={24}
                    color="#FFFFFF"
                  />
                </GlassSurface>
              </Pressable>
            )}
          </View>
        </View>

        {/* Hero Message */}
        <Text
          variant="headlineSmall"
          style={{
            color: "#FFFFFF",
            marginTop: 24,
            marginBottom: 24,
            lineHeight: 32,
            fontWeight: "600",
            paddingRight: 40,
          }}
        >
          Discover your next{"\n"}dream destination
        </Text>

        {/* Search Bar Entry */}
        <Pressable onPress={() => router.push("/search")}>
          <GlassSurface intensity={30} style={styles.searchBar}>
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color={theme.dark ? "#EEE" : "#FFF"}
              style={{ marginRight: 12 }}
            />
            <Text
              variant="bodyLarge"
              style={{
                color: theme.dark ? "#EEE" : "#FFF",
                flex: 1,
              }}
            >
              Search flights, hotels...
            </Text>
            <View
              style={[
                styles.filterIcon,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <MaterialCommunityIcons
                name="tune-variant"
                size={20}
                color="#FFF"
              />
            </View>
          </GlassSurface>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    // Negative margin to pull list up if needed, or just let it flow
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  iconGlass: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  filterIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
