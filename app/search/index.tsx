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
import { PackageFilters, TravelPackage } from "../../src/types"; // Added TravelPackage import

// Simple Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500); // 500ms delay

  const [results, setResults] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<PackageFilters>({});

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      let data: TravelPackage[] = [];

      // 1. If we have a query, use the robust Search (Title OR Dest)
      if (debouncedQuery.trim().length > 0) {
        data = await databaseService.packages.searchPackages(debouncedQuery);

        // 2. Client-side filtering for search results (since searchPackages doesn't support complex filters yet)
        if (filters.category && filters.category !== "all") {
          data = data.filter(
            (p) => p.category.toLowerCase() === filters.category!.toLowerCase()
          );
        }
        if (filters.minPrice) {
          data = data.filter((p) => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice) {
          data = data.filter((p) => p.price <= filters.maxPrice!);
        }
        if (filters.rating) {
          data = data.filter((p) => (p.rating || 0) >= filters.rating!);
        }
      } else {
        // 3. No query? Just use standard browse with filters
        const response = await databaseService.packages.getPackages(
          filters,
          50
        );
        data = response.documents;
      }

      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      // Optional: Toast.error("Search failed");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters]);

  // Trigger search when Debounced Query or Filters change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

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
          // onSubmitEditing no longer needed as we debounce, but keeps keyboard nice
          style={styles.searchBar}
          elevation={0}
          autoFocus={true}
          loading={isLoading}
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

      {/* Results */}
      {isLoading && results.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 16 }}>
              <PackageCard item={item} />
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
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.outline }}
                  >
                    Try simpler keywords or clear filters.
                  </Text>
                </>
              ) : (
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.outline }}
                >
                  Type to search destinations...
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
