import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, Chip, Text, useTheme } from "react-native-paper";
import { useStore } from "../store/useStore";
import type { TravelPackage } from "../types";

interface PackageCardProps {
  item: TravelPackage;
  style?: any;
  searchParams?: {
    startDate?: string;
    endDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
  };
}

const PackageCard = ({ item, style, searchParams }: PackageCardProps) => {
  const theme = useTheme();
  const router = useRouter();
  const activeComparison = useStore((state) =>
    state.comparisonList.includes(item.$id)
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

  return (
    <Card style={[styles.card, style]} onPress={handlePress} mode="elevated">
      <View style={styles.imageContainer}>
        <Image
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
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.gradient}
        />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
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
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleToggleFavorite}
          >
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#FF4757" : "#fff"}
            />
          </Pressable>
        </View>

        <View style={styles.priceTag}>
          <Text style={styles.priceText}>
            ${(item.price ?? 0).toLocaleString()}
          </Text>
        </View>
        <Chip
          icon="clock-outline"
          style={styles.durationChip}
          textStyle={styles.chipText}
          compact
        >
          {durationDays} Days
        </Chip>
      </View>

      <Card.Content style={styles.content}>
        <View style={styles.headerRow}>
          <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFC107" />
            <Text style={styles.rating}>{item.rating ?? 0}</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={16}
              color={theme.colors.secondary}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
              {item.destination}
            </Text>
          </View>

          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {item.reviewCount ?? 0} reviews
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.05)",
  },
  imageContainer: {
    height: 200,
    width: "100%",
    position: "relative",
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
    height: "70%",
  },

  actionsContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Removed old favoriteButton style
  activeButton: {
    backgroundColor: "#fff",
  },
  priceTag: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "#10B981",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  priceText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  durationChip: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    backdropFilter: "blur(10px)",
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontWeight: "bold",
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rating: {
    marginLeft: 4,
    fontWeight: "bold",
    fontSize: 13,
    color: "#D97706",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

export default PackageCard;
