import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { MotiPressable } from "moti/interactions";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import PackageCard from "../src/components/PackageCard";
import { packageService } from "../src/lib/databaseService";
import { TravelPackage } from "../src/types";

export default function CuratedPackagesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [destinations, setDestinations] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized animation states
  const animateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.95 : 1,
          opacity: pressed ? 0.8 : 1,
        };
      },
    [],
  );

  const cardAnimateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.97 : 1,
          opacity: pressed ? 0.9 : 1,
        };
      },
    [],
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch data in parallel
      const [featPackages, cats] = await Promise.all([
        packageService.getFeaturedPackages(10), // Fetch more for the "See All" screen
        packageService.getUniqueCategories(),
      ]);
      setPackages(featPackages);
      setDestinations(cats);
    } catch (error) {
      console.error("Failed to load curated data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationPress = (category: string) => {
    // Navigate to search with category filter or a specific category screen
    // For now, let's just go to search page with the query
    router.push({ pathname: "/search", params: { q: category } } as any);
  };

  const renderDestinationItem = ({
    item,
  }: {
    item: { id: string; name: string };
  }) => (
    <MotiPressable
      onPress={() => handleDestinationPress(item.name)}
      style={[
        styles.destinationCard,
        { backgroundColor: theme.colors.surfaceVariant },
      ]}
      animate={cardAnimateState}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 400,
      }}
    >
      <MaterialCommunityIcons
        name="map-marker-radius"
        size={24}
        color={theme.colors.primary}
      />
      <Text variant="labelLarge" style={{ marginTop: 8, fontWeight: "600" }}>
        {item.name}
      </Text>
    </MotiPressable>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Filter packages locally for instantaneous search on this screen (optional, or just rely on main search)
  const filteredPackages = packages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <MotiPressable
          onPress={() => router.back()}
          style={styles.backButton}
          animate={animateState}
          transition={{
            type: "spring",
            damping: 15,
            stiffness: 400,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurface}
          />
        </MotiPressable>
        <Text variant="headlineSmall" style={styles.title}>
          Curated Collections
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search collections..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Popular Destinations Section */}
        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Popular Destinations
          </Text>
        </View>

        <FlashList
          data={destinations}
          renderItem={renderDestinationItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.destinationList}
        />

        {/* Featured Packages Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Trending Packages
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            {filteredPackages.length} items
          </Text>
        </View>

        <FlashList
          data={filteredPackages}
          renderItem={({ item }) => (
            <View style={styles.packageCardWrapper}>
              <PackageCard item={item} />
            </View>
          )}
          contentContainerStyle={styles.packagesGrid}
          showsVerticalScrollIndicator={false}
        />

        {filteredPackages.length === 0 && (
          <View style={styles.center}>
            <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
              No packages match your search
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchbar: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    minHeight: 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  destinationList: {
    paddingHorizontal: 16,
  },
  destinationCard: {
    width: 120,
    height: 100,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  packagesGrid: {
    paddingHorizontal: 16,
  },
  packageCardWrapper: {
    marginBottom: 16,
  },
});
