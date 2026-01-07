import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Chip, Text, useTheme } from "react-native-paper";
import { useStore } from "../store/useStore";
import type { TravelPackage } from "../types";

interface PackageCardProps {
  item: TravelPackage;
  style?: any;
}

const PackageCard = ({ item, style }: PackageCardProps) => {
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
    router.push(`/details/${item.$id}`);
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
          source={{ uri: item.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.gradient}
        />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleCompare}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={activeComparison ? "scale-balance" : "scale-balance"}
              size={20}
              color={activeComparison ? theme.colors.primary : "#fff"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleToggleFavorite}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#FF4757" : "#fff"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.priceTag}>
          <Text style={styles.priceText}>${item.price.toLocaleString()}</Text>
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
            <Text style={styles.rating}>{item.rating}</Text>
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
            {item.reviewCount} reviews
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
  },
  imageContainer: {
    height: 180,
    width: "100%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12, // Match card border radius
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
    backgroundColor: "#FFC107",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  durationChip: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  chipText: {
    color: "#fff",
    fontSize: 12,
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
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rating: {
    marginLeft: 2,
    fontWeight: "bold",
    fontSize: 12,
    color: "#FF8F00",
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
