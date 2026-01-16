import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import PromotionalBanner from "../../src/components/home/PromotionalBanner";
import { GlassSurface } from "../../src/components/ui/GlassSurface";

import databaseService from "../../src/lib/databaseService";
import { useStore } from "../../src/store/useStore";
import type { TravelPackage } from "../../src/types";

import { shadows } from "../../src/theme";

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

  const [selectedCategory] = useState("all");
  const [isGridView, setIsGridView] = useState(false);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  ); // Dynamic Categories
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

        // Only apply category filter if valid and not "all"
        if (selectedCategory && selectedCategory !== "all") {
          // Safe cat lookup
          const catObj = categories.find((c) => c.id === selectedCategory);
          if (catObj) {
            filters.category = catObj.name;
          } else {
            // Should not happen if UI is consistent, but fallback safely
            console.warn("Category ID not found:", selectedCategory);
            filters.category = selectedCategory; // Try ID as fallback
          }
        }

        const response = await databaseService.packages.getPackages(filters);
        // Ensure response.documents exists
        setPackages(response?.documents || []);
      } catch (err) {
        console.error("Fetch Packages Error:", err);
        // Do not throw, keep UI alive
        setPackages([]);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, categories]
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

  // Scroll restoration for Grid Toggle
  const listRef = React.useRef<FlashList<TravelPackage>>(null);
  const scrollOffset = React.useRef(0);

  const handleScroll = useCallback((event: any) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  }, []);

  // Restore scroll when switching views
  useEffect(() => {
    if (listRef.current && scrollOffset.current > 0) {
      // Small timeout to allow layout to settle
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: scrollOffset.current,
          animated: false,
        });
      }, 50); // 50ms delay is usually enough
    }
  }, [isGridView]);

  const renderItem = useCallback(
    ({ item }: { item: TravelPackage }) => (
      <View
        style={[
          styles.packageCardWrapper,
          isGridView
            ? {
                flex: 0.5,
                paddingRight: 6, // Reduced padding for tighter grid
                paddingLeft: 6,
                paddingHorizontal: 0,
                marginBottom: 12, // Reduced margin
              }
            : {},
        ]}
      >
        <PackageCard item={item} isGrid={isGridView} />
      </View>
    ),
    [isGridView]
  );

  // ... (Header code remains mostly same, just ensuring correct context)

  const ListHeader = useCallback(
    () => (
      <View>
        {/* Header (UserInfo) */}
        <GlassSurface style={styles.header} intensity={60}>
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
        </GlassSurface>

        {/* Search Bar - Navigates to dedicated Search Screen */}
        <Pressable
          style={[styles.searchContainer, { marginBottom: 24 }]}
          onPress={() => router.push("/search" as any)}
        >
          <View pointerEvents="none">
            <Searchbar
              placeholder="Search packages, experts..."
              value=""
              style={styles.searchbar}
              elevation={1}
              iconColor={theme.colors.primary}
            />
          </View>
        </Pressable>

        {/* 1. Hero Carousel */}
        <HeroCarousel />

        {/* 2. Consulting Grid */}
        <ConsultingGrid />

        {/* 3. Expertise Showcase */}
        <ExpertiseShowcase />

        {/* 3.5 Promotional Banner */}
        <PromotionalBanner />

        {/* Featured Packages Title */}
        <View style={[styles.sectionHeader, { marginTop: 10 }]}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Curated Packages
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable onPress={() => setIsGridView(!isGridView)} hitSlop={10}>
              <MaterialCommunityIcons
                name={isGridView ? "view-list" : "view-grid"}
                size={28}
                color={theme.colors.primary}
              />
            </Pressable>
            <Pressable onPress={() => router.push("/curated" as any)}>
              <Text
                variant="labelLarge"
                style={{ color: theme.colors.primary, fontWeight: "bold" }}
              >
                See All
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    ),
    [theme.colors, user, router, isGridView]
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
        ref={listRef}
        data={packages}
        renderItem={renderItem}
        keyExtractor={(item) => item.$id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={{
          paddingBottom: 140, // Increased padding for Nav Bar
          paddingHorizontal: isGridView ? 8 : 0,
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onScroll={handleScroll} // Track scroll
        scrollEventThrottle={16}
        numColumns={isGridView ? 2 : 1}
        key={isGridView ? "grid" : "list"}
        estimatedItemSize={280}
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
    paddingVertical: 16,
    marginBottom: 20,
    borderRadius: 24, // Consistent radius for the glass container
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
    ...shadows.sm, // Platform Adaptive Shadow
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
