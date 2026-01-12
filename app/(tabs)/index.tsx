import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Avatar,
  Button,
  Chip,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import PackageCard from "../../src/components/PackageCard";
import { PackageCardSkeleton } from "../../src/components/Skeleton";
import { useSearch } from "../../src/hooks/useSearch";
import databaseService from "../../src/lib/databaseService";
import { useStore } from "../../src/store/useStore";
import type { TravelPackage } from "../../src/types";

// Destination categories - to be managed via Admin Dashboard
const DESTINATION_CATEGORIES = [
  { id: "india", name: "India" },
  { id: "gulf", name: "Gulf" },
  { id: "uk", name: "UK & Europe" },
  { id: "usa", name: "USA" },
  { id: "asia", name: "Asia" },
];

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { history, addToHistory } = useSearch();

  // Fetch packages from Appwrite
  const fetchPackages = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setIsLoading(true);
      try {
        const filters: any = {};
        if (selectedCategory !== "all") {
          filters.category = selectedCategory;
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
    [selectedCategory, searchQuery]
  );

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPackages(true);
  }, [fetchPackages]);

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
        {/* Header */}
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
          <TouchableOpacity onPress={() => router.push("/profile")}>
            {user?.avatar ? (
              <Avatar.Image size={44} source={{ uri: user.avatar }} />
            ) : (
              <Avatar.Text
                size={44}
                label={user?.name?.substring(0, 2).toUpperCase() || "U"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Where to next?"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            elevation={1}
            iconColor={theme.colors.primary}
            onSubmitEditing={() => addToHistory(searchQuery)}
          />
          {searchQuery === "" && history.length > 0 && (
            <View style={styles.historyContainer}>
              <Text
                variant="labelMedium"
                style={{ marginBottom: 8, color: "#666" }}
              >
                Recent Searches
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {history.map((term, index) => (
                  <Chip
                    key={index}
                    onPress={() => setSearchQuery(term)}
                    icon="history"
                    compact
                  >
                    {term}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Destinations
          </Text>
        </View>
        <FlashList
          horizontal
          data={["all", ...DESTINATION_CATEGORIES.map((cat) => cat.id)]}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item }) => {
            const isAll = item === "all";
            const categoryObj = isAll
              ? { id: "all", name: "All" }
              : DESTINATION_CATEGORIES.find((c) => c.id === item);

            if (!categoryObj) return null;

            return (
              <Chip
                selected={selectedCategory === categoryObj.id}
                onPress={() => setSelectedCategory(categoryObj.id)}
                style={[
                  styles.categoryChip,
                  selectedCategory === categoryObj.id && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                textStyle={
                  selectedCategory === categoryObj.id ? { color: "#fff" } : {}
                }
                showSelectedOverlay
              >
                {categoryObj.name}
              </Chip>
            );
          }}
        />

        {/* Featured Packages Title */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Recommended for You
          </Text>
          <TouchableOpacity>
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.primary, fontWeight: "bold" }}
            >
              See All
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [
      theme.colors,
      user,
      searchQuery,
      history,
      selectedCategory,
      addToHistory,
      router,
    ]
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
