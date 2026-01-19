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

interface DestinationScrollerProps {
  title?: string;
}

export default function DestinationScroller({
  title = "Where would you like to visit?",
}: DestinationScrollerProps) {
  const router = useRouter();
  const theme = useTheme();
  const [destinations, setDestinations] = useState<
    { $id: string; name: string; image: string }[]
  >([]);

  useEffect(() => {
    const loadDestinations = async () => {
      const data = await databaseService.content.getDestinations();
      setDestinations(data);
    };
    loadDestinations();
  }, []);

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

  const handlePress = (destination: { $id: string; name: string }) => {
    router.push({
      pathname: "/search",
      params: { q: destination.name },
    } as any);
  };

  if (destinations.length === 0) {
    return null; // Don't render if no destinations loaded
  }

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
        {destinations.map((destination) => (
          <MotiPressable
            key={destination.$id}
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
    opacity: 0.5,
  },
  name: {
    fontWeight: "500",
    textAlign: "center",
  },
});
