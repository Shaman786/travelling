/**
 * Saved/Favorites Tab
 *
 * Shows user's saved packages and destinations
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiView } from "moti";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import PackageCard from "../../src/components/PackageCard";
import { PackageCardSkeleton } from "../../src/components/Skeleton";
import databaseService from "../../src/lib/databaseService";
import { useStore } from "../../src/store/useStore";
import { colors, spacing } from "../../src/theme";
import type { TravelPackage } from "../../src/types";

export default function SavedScreen() {
  const theme = useTheme();
  const favoritePackages = useStore((state) => state.favoritePackages);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      if (favoritePackages.length === 0) {
        setPackages([]);
        return;
      }
      // Fetch packages that are in favorites list
      const response = await databaseService.packages.getPackages({});
      const favPackages = response?.documents?.filter((pkg: TravelPackage) =>
        favoritePackages.includes(pkg.$id),
      );
      setPackages(favPackages || []);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  }, [favoritePackages]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const renderEmptyState = () => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
      style={styles.emptyContainer}
    >
      <View style={styles.emptyIconContainer}>
        <MaterialCommunityIcons
          name="heart-outline"
          size={80}
          color={colors.accent}
        />
      </View>
      <Text variant="headlineSmall" style={styles.emptyTitle}>
        No saved trips yet
      </Text>
      <Text variant="bodyMedium" style={styles.emptySubtitle}>
        Start exploring and save trips you love!
      </Text>
    </MotiView>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Saved Trips
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
          {favoritePackages.length}{" "}
          {favoritePackages.length === 1 ? "trip" : "trips"}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <PackageCardSkeleton />
          <PackageCardSkeleton />
        </View>
      ) : packages.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={packages}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <PackageCard item={item} />
            </View>
          )}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  loadingContainer: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  cardWrapper: {
    marginBottom: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${colors.accent}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: "center",
  },
});
