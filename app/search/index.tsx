/**
 * Search Screen
 *
 * Full-text search and filtering for travel packages.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Badge,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import FilterSheet from "../../src/components/FilterSheet";
import PackageCard from "../../src/components/PackageCard";
import databaseService from "../../src/lib/databaseService";
import type { PackageFilters, TravelPackage } from "../../src/types";

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PackageFilters>({});

  // Debounce search could be better, but explicit search on enter/icon is fine for now

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      let data: TravelPackage[] = [];

      const activeFilters: PackageFilters = {
        ...filters,
        search: query || undefined,
      };

      // If query is present, use search, otherwise use list with filters
      // databaseService.packages.getPackages handles filters including searchQuery if implemented there
      // Let's check implementation: getPackages DOES support filters.search

      const response = await databaseService.packages.getPackages(
        activeFilters,
        50
      );
      data = response.documents;

      setResults(data);
    } catch {
      // Quiet fail
    } finally {
      setIsLoading(false);
    }
  }, [query, filters]);

  // Initial load (optional, maybe showing nothing is better, or showing all)
  useEffect(() => {
    handleSearch();
  }, [filters, handleSearch]); // Auto-search when filters change

  const activeFilterCount = Object.keys(filters).filter(
    (k) => filters[k as keyof PackageFilters] !== undefined
  ).length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header with Search Bar */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Searchbar
          placeholder="Where to next?"
          onChangeText={setQuery}
          value={query}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          elevation={0}
          autoFocus={true}
        />
        <View>
          <IconButton
            icon="filter-variant"
            onPress={() => setShowFilters(true)}
          />
          {activeFilterCount > 0 && (
            <Badge style={styles.badge}>{activeFilterCount}</Badge>
          )}
        </View>
      </View>

      {/* Active Filters Row (Optional, maybe just rely on badge) */}

      {/* Results */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <PackageCard
                package={item}
                onPress={() => router.push(`/details/${item.$id}`)}
              />
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              {query ? (
                <>
                  <MaterialCommunityIcons
                    name="map-search-outline"
                    size={64}
                    color={theme.colors.outline}
                  />
                  <Text
                    variant="bodyLarge"
                    style={{ marginTop: 16, color: theme.colors.outline }}
                  >
                    No packages found for &quot;{query}&quot;
                  </Text>
                </>
              ) : (
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.outline }}
                >
                  Search for destinations, activities, or countries.
                </Text>
              )}
            </View>
          }
        />
      )}

      {/* Filter Sheet */}
      <FilterSheet
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        currentFilters={filters}
        onApply={setFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingRight: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#F0F5FF",
    height: 48,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  list: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    marginTop: 64,
  },
});
