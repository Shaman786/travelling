import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
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

  // const [searchQuery, setSearchQuery] = useState(""); <-- Leaving this next line alone

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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          <Chip
            selected={selectedCategory === "all"}
            onPress={() => setSelectedCategory("all")}
            style={[
              styles.categoryChip,
              selectedCategory === "all" && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            textStyle={selectedCategory === "all" ? { color: "#fff" } : {}}
            showSelectedOverlay
          >
            All
          </Chip>
          {DESTINATION_CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              selected={selectedCategory === cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              textStyle={selectedCategory === cat.id ? { color: "#fff" } : {}}
              showSelectedOverlay
            >
              {cat.name}
            </Chip>
          ))}
        </ScrollView>

        {/* Featured Packages */}
        <View style={styles.sectionHeader}>
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
        <View style={styles.packagesGrid}>
          {isLoading ? (
            <>
              <PackageCardSkeleton />
              <PackageCardSkeleton />
              <PackageCardSkeleton />
            </>
          ) : packages.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.outline }}
              >
                No packages found. Try adjusting your search.
              </Text>
            </View>
          ) : (
            packages.map((item) => (
              <PackageCard
                key={item.$id}
                item={item}
                style={styles.packageCard}
              />
            ))
          )}
        </View>
        <View style={styles.footerSpacer} />
      </ScrollView>

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
    gap: 16,
    paddingBottom: 24,
    alignItems: "center",
  },
  categoryChip: {
    marginRight: 8,
    height: 40,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 8,
  },
  categoryImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categorySelected: {
    // Border color applied via inline style
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  categoryName: {
    color: "#6B7280",
  },
  packagesGrid: {
    paddingHorizontal: 20,
  },
  packageCard: {
    marginBottom: 20,
  },
  footerSpacer: {
    height: 100,
  },
});
