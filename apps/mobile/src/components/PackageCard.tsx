import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import Animated from "react-native-reanimated";
import { useStore } from "../store/useStore";
import { shadows } from "../theme";
import type { TravelPackage } from "../types";

interface PackageCardProps {
  item: TravelPackage;
  style?: any;
  isGrid?: boolean; // New prop for Grid Mode
  searchParams?: {
    startDate?: string;
    endDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
  };
}

const PackageCard = ({
  item,
  style,
  searchParams,
  isGrid = false,
}: PackageCardProps) => {
  const theme = useTheme();
  const router = useRouter();
  const activeComparison = useStore((state) =>
    state.comparisonList.includes(item.$id),
  );
  const favoritePackages = useStore((state) => state.favoritePackages);
  const toggleFavorite = useStore((state) => state.toggleFavorite);
  const addToComparison = useStore((state) => state.addToComparison);
  const removeFromComparison = useStore((state) => state.removeFromComparison);

  const toggleCompare = () => {
    if (activeComparison) {
      removeFromComparison(item.$id);
    } else {
      addToComparison(item.$id);
    }
  };

  const isFavorite = favoritePackages.includes(item.$id);

  const handlePress = () => {
    router.push({
      pathname: `/details/${item.$id}` as any,
      params: searchParams,
    });
  };

  const handleToggleFavorite = () => {
    toggleFavorite(item.$id);
  };

  // Parse duration string (e.g., "7 Days / 6 Nights") to get days
  const durationDays = item.duration?.match(/(\d+)\s*Days?/i)?.[1] || "N/A";

  const AnimatedImage = Animated.createAnimatedComponent(Image) as any;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 500, delay: 100 }}
      style={[
        styles.cardWrapper,
        isGrid && { marginBottom: 12, marginHorizontal: 0 },
        style,
      ]}
    >
      <Card
        style={[styles.card, { backgroundColor: theme.colors.surface }]}
        onPress={handlePress}
        mode="elevated"
      >
        <View style={styles.imageContainer}>
          <AnimatedImage
            source={{
              uri:
                item.imageUrl ||
                "https://picsum.photos/seed/" + item.$id + "/600/400",
            }}
            style={styles.image}
            contentFit="cover"
            transition={500}
            cachePolicy="memory-disk"
            placeholder={require("../../assets/images/splash-icon.png")}
            sharedTransitionTag={`image-${item.$id}`}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.6)"]}
            style={styles.gradient}
          />

          {/* Action Buttons - Adjusted for Grid */}
          <View style={styles.actionsContainer}>
            {!isGrid && (
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={toggleCompare}
              >
                <MaterialCommunityIcons
                  name={activeComparison ? "scale-balance" : "scale-balance"}
                  size={20}
                  color={activeComparison ? theme.colors.primary : "#fff"}
                />
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.7 : 1 },
                isGrid && { width: 32, height: 32 },
              ]}
              onPress={handleToggleFavorite}
            >
              <MotiView
                from={{ scale: 1 }}
                animate={{ scale: isFavorite ? 1.2 : 1 }}
                transition={{ type: "spring", damping: 10 }}
              >
                <MaterialCommunityIcons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={isGrid ? 16 : 20}
                  color={isFavorite ? "#FF4757" : "#fff"}
                />
              </MotiView>
            </Pressable>
          </View>

          {/* Price Tag - Rounded Pill */}
          <View
            style={[
              styles.priceTag,
              isGrid && {
                paddingHorizontal: 8,
                paddingVertical: 4,
                bottom: 10,
                right: 10,
              },
            ]}
          >
            <Text style={[styles.priceText, isGrid && { fontSize: 13 }]}>
              ${(item.price ?? 0).toLocaleString()}
            </Text>
          </View>

          {/* Duration Chip */}
          <View
            style={[
              styles.durationChipWrapper,
              isGrid && { top: 12, left: 12, transform: [{ scale: 0.9 }] },
            ]}
          >
            <View style={styles.blurChip}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.chipText}>{durationDays} Days</Text>
            </View>
          </View>
        </View>

        <Card.Content
          style={[
            styles.content,
            { backgroundColor: theme.colors.surface },
            isGrid && { paddingHorizontal: 10, paddingVertical: 10 },
          ]}
        >
          {/* Title & Location Block */}
          <View style={{ marginBottom: 12 }}>
            <Text
              variant={isGrid ? "titleSmall" : "titleMedium"}
              style={[styles.title, { color: theme.colors.onSurface }]}
              numberOfLines={isGrid ? 2 : 2}
            >
              {item.title}
            </Text>

            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={theme.colors.secondary}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.secondary, marginLeft: 2 }}
                numberOfLines={1}
              >
                {item.destination}
              </Text>
            </View>
          </View>

          {/* Footer: Rating & Reviews */}
          <View style={styles.footerRow}>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
              <Text
                style={[styles.ratingVal, { color: theme.colors.onSurface }]}
              >
                {item.rating ?? 0}
              </Text>
              {!isGrid && (
                <Text
                  style={[styles.reviewCount, { color: theme.colors.outline }]}
                >
                  ({item.reviewCount ?? 0} reviews)
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 20,
    marginHorizontal: 2,
    width: "100%",
  },
  card: {
    borderRadius: 24, // Increased Radius
    overflow: "visible", // Allow shadow
    ...shadows.md,
    borderWidth: 0, // No border
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 4 / 3,
    position: "relative",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%", // Subtle gradient
  },

  actionsContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.25)", // Softer translucent
    justifyContent: "center",
    alignItems: "center",
  },

  priceTag: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.6)", // Transparent dark background
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100, // Pill
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  priceText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  durationChipWrapper: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  blurChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontWeight: "800", // Extra bold
    letterSpacing: 0.3,
    marginBottom: 4,
    fontSize: 18,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "baseline", // Align text baseline
  },
  ratingVal: {
    fontWeight: "bold",
    marginLeft: 4,
    fontSize: 14,
  },
  reviewCount: {
    fontSize: 13,
    marginLeft: 4,
  },
});

export default PackageCard;
