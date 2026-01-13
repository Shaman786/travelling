import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar, Button, Searchbar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import PackageCard from "../../src/components/PackageCard";
import { PackageCardSkeleton } from "../../src/components/Skeleton";
import ConsultingGrid from "../../src/components/home/ConsultingGrid";
import ExpertiseShowcase from "../../src/components/home/ExpertiseShowcase";
import HeroCarousel from "../../src/components/home/HeroCarousel";
import { useSearch } from "../../src/hooks/useSearch";
import databaseService from "../../src/lib/databaseService";
import { useStore } from "../../src/store/useStore";
import type { TravelPackage } from "../../src/types";

// DESTINATION_CATEGORIES removed - fetched dynamically

export default function CatalogScreen() {
  const theme = useTheme();
  const router = useRouter();

  /*
   * FIX: Split useStore selectors to avoid object identity loop.
   * Do NOT return an object literal from useStore without useShallow.
   */
  const user = useStore((state) => state.user);
  const comparisonList = useStore((state) => state.comparisonList);
  const clearComparison = useStore((state) => state.clearComparison);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory] = useState("all");
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  ); // Dynamic Categories
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToHistory } = useSearch();

  // Load Categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await databaseService.packages.getUniqueCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  // Fetch packages from Appwrite
  const fetchPackages = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setIsLoading(true);
      try {
        const filters: any = {};
        if (selectedCategory !== "all") {
          // Find the category object to match strict filtering if needed,
          // or just pass the ID if your backend expects that.
          // The previous hardcoded IDs were lowercase, our new dynamic ones are too.
          // However, dependent on how you saved data, 'category' might be 'India' or 'india'.
          // Let's assume the ID we generated (lowercase) matches what we want to filter by, OR filter by the Name if that's what is stored.
          // Inspecting getUniqueCategories: I used pkg.category (likely capitalized) to generate ID (lower).
          // If the DB stores "India", and we filter by "india", it might fail without case-insensitivity.
          // Robust fix: Use the Name (original casing) for filtering if that's what matches the DB field.
          const catObj = categories.find((c) => c.id === selectedCategory);
          filters.category = catObj ? catObj.name : selectedCategory;
        }
        if (searchQuery) {
          filters.search = searchQuery;
        }
        const response = await databaseService.packages.getPackages(filters);
        setPackages(response.documents);
      } catch {
        // Fallback handled by service
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, searchQuery, categories]
  );

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPackages(true);
  }, [fetchPackages]);

  /* New Components Import */
  // It is assumed imports will be handled by auto-import or manual addition at top
  // But since I am editing the file, I will add them in a separate step or try to add them here if possible.

  const renderItem = useCallback(
    ({ item }: { item: TravelPackage }) => (
      <View style={styles.packageCardWrapper}>
        <PackageCard item={item} />
      </View>
    ),
    []
  );

  const ListHeader = useCallback(
    () => (
      <View>
        {/* Header (UserInfo) */}
        <View style={styles.header}>
          <View>
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.secondary }}
            >
              Welcome back,
            </Text>
            <Text variant="headlineMedium" style={styles.userName}>
              {user?.name || "Traveller"} 👋
            </Text>
          </View>
          <Pressable onPress={() => router.push("/(tabs)/profile" as any)}>
            {user?.avatar ? (
              <Avatar.Image size={44} source={{ uri: user.avatar }} />
            ) : (
              <Avatar.Text
                size={44}
                label={user?.name?.substring(0, 2).toUpperCase() || "U"}
              />
            )}
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search packages, experts..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            elevation={1}
            iconColor={theme.colors.primary}
            onSubmitEditing={() => addToHistory(searchQuery)}
          />
        </View>

        {/* 1. Hero Carousel */}
        <HeroCarousel />

        {/* 2. Consulting Grid */}
        <ConsultingGrid />

        {/* 3. Expertise Showcase */}
        <ExpertiseShowcase />

        {/* Featured Packages Title */}
        <View style={[styles.sectionHeader, { marginTop: 10 }]}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Curated Packages
          </Text>
          <Pressable
            onPress={() => setIsLoading(true) /* Trigger refresh or nav */}
          >
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.primary, fontWeight: "bold" }}
            >
              See All
            </Text>
          </Pressable>
        </View>
      </View>
    ),
    [theme.colors, user, searchQuery, addToHistory, router]
  );

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View style={{ paddingHorizontal: 20 }}>
          <PackageCardSkeleton />
          <PackageCardSkeleton />
          <PackageCardSkeleton />
        </View>
      );
    }
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
          No packages found. Try adjusting your search.
        </Text>
      </View>
    );
  }, [isLoading, theme.colors.outline]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlashList
        data={packages}
        renderItem={renderItem}
        keyExtractor={(item) => item.$id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Comparison Floating Bar */}
      {comparisonList.length > 0 && (
        <View style={styles.compareBar}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {comparisonList.length} packages selected
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              mode="contained"
              onPress={() => clearComparison()}
              style={{ backgroundColor: "#444" }}
              compact
            >
              Clear
            </Button>
            <Button
              mode="contained"
              onPress={() => router.push("/compare" as any)}
              buttonColor={theme.colors.primary}
              compact
            >
              Compare
            </Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  compareBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1A1A2E",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  userName: {
    fontWeight: "bold",
    color: "#1A1A2E",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchbar: {
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  historyContainer: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#1A1A2E",
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingBottom: 8, // FlashList handled
  },
  categoryChip: {
    marginRight: 8,
    height: 40,
  },
  packageCardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});
