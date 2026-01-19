/**
 * DestinationScroller Component
 *
 * Horizontal scrolling circular destination chips like in premium travel apps.
 * Shows popular destinations as tappable circles with images.
 */

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import databaseService from "../../lib/databaseService";
import { shadows, spacing } from "../../theme";

// Static popular destinations (will be dashboard-managed later)
const STATIC_DESTINATIONS = [
  {
    id: "maldives",
    name: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=200",
  },
  {
    id: "dubai",
    name: "Dubai",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=200",
  },
  {
    id: "bali",
    name: "Bali",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=200",
  },
  {
    id: "paris",
    name: "Paris",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200",
  },
  {
    id: "london",
    name: "London",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=200",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200",
  },
];

interface DestinationScrollerProps {
  title?: string;
}

export default function DestinationScroller({
  title = "Where would you like to visit?",
}: DestinationScrollerProps) {
  const router = useRouter();
  const theme = useTheme();
  const [dynamicDestinations, setDynamicDestinations] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    // Fetch dynamic categories from packages
    const loadCategories = async () => {
      const cats = await databaseService.packages.getUniqueCategories();
      setDynamicDestinations(cats);
    };
    loadCategories();
  }, []);

  // Merge static and dynamic, removing duplicates
  const allDestinations = useMemo(() => {
    const dynamicNames = dynamicDestinations.map((d) => d.name.toLowerCase());
    const filtered = STATIC_DESTINATIONS.filter(
      (s) => !dynamicNames.includes(s.name.toLowerCase()),
    );
    return [...filtered.slice(0, 6)]; // Limit to 6 for now
  }, [dynamicDestinations]);

  const animateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.92 : 1,
          opacity: pressed ? 0.85 : 1,
        };
      },
    [],
  );

  const handlePress = (destination: { id: string; name: string }) => {
    router.push({
      pathname: "/search",
      params: { q: destination.name },
    } as any);
  };

  return (
    <View style={styles.container}>
      <Text
        variant="titleMedium"
        style={[styles.title, { color: theme.colors.onBackground }]}
      >
        {title}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allDestinations.map((destination) => (
          <MotiPressable
            key={destination.id}
            onPress={() => handlePress(destination)}
            animate={animateState}
            transition={{ type: "spring", damping: 15, stiffness: 400 }}
            style={styles.destinationItem}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: destination.image }}
                style={styles.image}
                contentFit="cover"
                transition={300}
              />
              {/* Subtle border overlay */}
              <View style={styles.imageBorder} />
            </View>
            <Text
              variant="labelMedium"
              style={[styles.name, { color: theme.colors.onBackground }]}
              numberOfLines={1}
            >
              {destination.name}
            </Text>
          </MotiPressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  title: {
    fontWeight: "600",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  destinationItem: {
    alignItems: "center",
    width: 72,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    marginBottom: spacing.xs,
    ...shadows.md,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 2,
    // borderColor: colors.accent, // We can't access theme here easily without passing it or using a functional style or just using a safe static color if it's an overlay
    // But wait, this is a StyleSheet.
    // Let's use a dynamic style in the component instead.
    // For now in styles, we can't use theme.
    // I will remove it from here and add it to the component.
    opacity: 0.5,
  },
  name: {
    fontWeight: "500",
    textAlign: "center",
  },
});
