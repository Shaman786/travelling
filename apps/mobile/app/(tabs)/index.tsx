import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import PackageCard from "../../src/components/PackageCard";
import { PackageCardSkeleton } from "../../src/components/Skeleton";
import CategoryChips from "../../src/components/home/CategoryChips";
import ConsultingGrid from "../../src/components/home/ConsultingGrid";
import DestinationScroller from "../../src/components/home/DestinationScroller";
import ExpertiseShowcase from "../../src/components/home/ExpertiseShowcase";
import { HeroSection } from "../../src/components/home/HeroSection";
import PromotionalBanner from "../../src/components/home/PromotionalBanner";
import TwoToneHeadline from "../../src/components/ui/TwoToneHeadline";

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

  const [selectedCategory] = useState("all");
  const [isGridView, setIsGridView] = useState(false);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  ); // Dynamic Categories
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load Categories on mount and enable LayoutAnimation
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await databaseService.packages.getUniqueCategories();
      setCategories(cats);
    };
    loadCategories();

    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Fetch unread notifications count on focus
  useFocusEffect(
    useCallback(() => {
      if (user?.$id) {
        databaseService.notifications
          .getUnreadCount(user.$id)
          .then(setUnreadCount)
          .catch((err) => console.error("Failed to get unread count:", err));
      } else {
        setUnreadCount(0);
      }
    }, [user?.$id]),
  );

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

        // Limit to 10 for "Popular Destinations" unless specific category selected (which acts as filter)
        // If "all" category, we assume it's the main feed which should show popular/featured
        if (
          (!selectedCategory || selectedCategory === "all") &&
          !filters.category
        ) {
          (filters as any).limit = 10;
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
    [selectedCategory, categories],
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

  // Manual scroll restoration removed in favor of FlashList v2 native handling
  const listRef = React.useRef<any>(null);

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
    [isGridView],
  );

  // ... (Header code remains mostly same, just ensuring correct context)

  // Memoize the ListHeaderComponent
  const HeaderComponent = React.useMemo(() => {
    const Header = () => (
      <View>
        <HeroSection
          userName={user?.name?.split(" ")[0] || "Traveller"}
          unreadCount={unreadCount}
          onNotificationPress={() => router.push("/notifications" as any)}
          onSettingsPress={() => router.push("/settings" as any)}
        />

        {/* 1. Destination Scroller (Where to go?) */}
        <DestinationScroller title="Where to next?" />

        {/* 2. Category Chips (Filters) */}
        <CategoryChips selectedCategory={selectedCategory} />

        {/* 3. Services Grid (Moved down) */}
        <View style={{ paddingHorizontal: 20, marginTop: 16, marginBottom: 8 }}>
          <TwoToneHeadline highlight="Services" prefix="Our" size="small" />
        </View>
        <ConsultingGrid />

        {/* 4. Expertise Showcase */}
        <ExpertiseShowcase />

        {/* 5. Promotional Banner */}
        <PromotionalBanner />

        {/* Featured Packages Title */}
        <View style={[styles.sectionHeader, { marginTop: 16 }]}>
          <TwoToneHeadline
            highlight="Destinations"
            prefix="Popular"
            size="small" // "lil bit small"
          />
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => {
                listRef.current?.prepareForLayoutAnimationRender();
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setIsGridView(!isGridView);
              }}
              hitSlop={10}
              style={[
                styles.gridToggle,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
            >
              <MaterialCommunityIcons
                name={isGridView ? "view-list" : "view-grid"}
                size={22} // Slightly smaller icon
                color={theme.colors.primary}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/curated" as any)}
              style={styles.seeAllBtn}
            >
              <Text
                variant="labelLarge"
                style={{
                  color: theme.colors.primary,
                  fontWeight: "bold",
                  fontSize: 13,
                }}
              >
                See All
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={theme.colors.primary}
              />
            </Pressable>
          </View>
        </View>
      </View>
    );
    return Header;
  }, [theme.colors, user, router, isGridView, selectedCategory, unreadCount]);

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

  // Move safe area hook to top (already imported)
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]} // Move bottom padding to contentContainer
    >
      <FlashList
        ref={listRef}
        data={packages}
        extraData={isGridView}
        renderItem={renderItem}
        // Removed explicit key to allow native layout transition
        keyExtractor={(item) => item.$id}
        ListHeaderComponent={HeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 100, // Reduce tracking jank
        }}
        contentContainerStyle={{
          paddingBottom: 100 + (insets.bottom || 20), // Dynamic bottom padding for gesture nav
          paddingHorizontal: isGridView ? 8 : 0,
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        numColumns={isGridView ? 2 : 1}
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
    backgroundColor: "#1A1A2E", // Keep dark bg for contrast even in light mode? Or maybe primary?
    // Let's keep it fixed dark since text is #fff. Or adapt if needed.
    // For now, let's keep it distinctive.
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 20, // Ensure absolute right padding
  },
  gridToggle: {
    padding: 4,
    // backgroundColor: "#F3F4F6", handled dynamically
    borderRadius: 8,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
});
