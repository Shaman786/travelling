/**
 * Search Screen
 *
 * Full-text search and filtering for travel packages.
 * Includes Search History.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Badge,
  Button,
  Chip,
  IconButton,
  Searchbar,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import Mapbox from "@rnmapbox/maps";
import { format } from "date-fns";
import { DatePickerModal } from "react-native-paper-dates";
import FilterSheet from "../../src/components/FilterSheet";
import PackageCard from "../../src/components/PackageCard";
import TravelerSelector from "../../src/components/search/TravelerSelector";
import SortSheet from "../../src/components/SortSheet";
import { useSearch } from "../../src/hooks/useSearch";
import databaseService from "../../src/lib/databaseService";
import { borderRadius, shadows } from "../../src/theme";
import { PackageFilters, TravelPackage } from "../../src/types";

// Public Token for Mapbox (Client-side)
const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_KEY || "";
if (!mapboxToken) {
  console.warn("Mapbox Public Key is missing! Maps may crash or not render.");
}
Mapbox.setAccessToken(mapboxToken);

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
  const { history, addToHistory, clearHistory } = useSearch();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500); // 500ms delay

  const [results, setResults] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapView, setIsMapView] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [filters, setFilters] = useState<PackageFilters>({});

  // Extended Search Params
  const [range, setRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({ startDate: undefined, endDate: undefined });
  const [openDate, setOpenDate] = useState(false);

  const [openTravelers, setOpenTravelers] = useState(false);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const onDismissDate = useCallback(() => {
    setOpenDate(false);
  }, [setOpenDate]);

  const onConfirmDate = useCallback(
    ({
      startDate,
      endDate,
    }: {
      startDate: Date | undefined;
      endDate: Date | undefined;
    }) => {
      setOpenDate(false);
      setRange({ startDate, endDate });
    },
    [setOpenDate, setRange]
  );

  // Request Location Permissions
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
      }
    })();
  }, []);

  // Ref for addToHistory to avoid dependency cycles
  const addToHistoryRef = React.useRef(addToHistory);
  useEffect(() => {
    addToHistoryRef.current = addToHistory;
  }, [addToHistory]);

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      let data: TravelPackage[] = [];

      // 1. If we have a query, use the robust Search (Title OR Dest)
      if (debouncedQuery.trim().length > 0) {
        // Save to history using Ref
        addToHistoryRef.current(debouncedQuery);

        data = await databaseService.packages.searchPackages(debouncedQuery);
        // ... filtering logic ...
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
        const hasFilters = Object.keys(filters).some(
          (k) => filters[k as keyof PackageFilters] !== undefined
        );

        if (hasFilters) {
          const response = await databaseService.packages.getPackages(
            filters,
            50
          );
          data = response.documents;
        } else {
          data = [];
        }
      }

      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery, filters]);

  // Trigger search when Debounced Query or Filters change
  useEffect(() => {
    console.log("SearchScreen: performSearch effect triggered", {
      query: debouncedQuery,
      filters,
    });
    performSearch();
  }, [performSearch, debouncedQuery, filters]);

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
          style={styles.searchBar}
          elevation={0}
          autoFocus={true}
          loading={isLoading}
        />
        <View style={{ flexDirection: "row" }}>
          <IconButton
            icon="sort"
            onPress={() => setShowSort(true)}
            iconColor={theme.colors.primary}
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
      </View>

      {/* Extended Inputs */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 8,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        }}
      >
        <Button
          mode="contained-tonal"
          onPress={() => setIsMapView(!isMapView)}
          icon={isMapView ? "format-list-bulleted" : "map"}
          compact
          style={{ flex: 0 }}
        >
          {isMapView ? "List" : "Map"}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setOpenDate(true)}
          icon="calendar"
          compact
          style={{ flex: 1, borderColor: theme.colors.outlineVariant }}
          contentStyle={{ flexDirection: "row-reverse" }}
        >
          {range.startDate
            ? `${format(range.startDate, "MMM dd")} - ${range.endDate ? format(range.endDate, "MMM dd") : "..."}`
            : "Dates"}
        </Button>
        <Button
          mode="outlined"
          onPress={() => setOpenTravelers(true)}
          icon="account-group"
          compact
          style={{ flex: 1, borderColor: theme.colors.outlineVariant }}
          contentStyle={{ flexDirection: "row-reverse" }}
        >
          {adults + childrenCount + infants} Guests
        </Button>
      </View>

      {/* Results */}
      {isMapView ? (
        <View style={{ flex: 1 }}>
          <Mapbox.MapView
            style={{ flex: 1 }}
            styleURL={Mapbox.StyleURL.Light}
            logoEnabled={false}
          >
            <Mapbox.Camera
              zoomLevel={2}
              centerCoordinate={[78.9629, 20.5937]} // Default to India center
            />
            <Mapbox.UserLocation
              visible={true}
              renderMode={Mapbox.UserLocationRenderMode.Native}
            />
            {results.map((pkg) => {
              const lat = Number(pkg.latitude);
              const lng = Number(pkg.longitude);
              const validLat = !isNaN(lat) ? lat : 20.5937;
              const validLng = !isNaN(lng) ? lng : 78.9629;

              return (
                <Mapbox.PointAnnotation
                  key={pkg.$id}
                  id={pkg.$id}
                  coordinate={[validLng, validLat]}
                  onSelected={() =>
                    router.push(
                      `/package/${pkg.$id}` as `/package/${string}` as any
                    )
                  }
                >
                  <View
                    style={{
                      backgroundColor: "white",
                      padding: 4,
                      borderRadius: borderRadius.sm,
                      ...shadows.md,
                    }}
                  >
                    <Text variant="labelSmall" style={{ fontWeight: "bold" }}>
                      ${pkg.price}
                    </Text>
                  </View>
                </Mapbox.PointAnnotation>
              );
            })}
          </Mapbox.MapView>
        </View>
      ) : isLoading && results.length === 0 ? (
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
                item={item}
                searchParams={{
                  startDate: range.startDate?.toISOString(),
                  endDate: range.endDate?.toISOString(),
                  adults,
                  children: childrenCount,
                  infants,
                }}
              />
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              {!query ? (
                // Show History if no query
                <>
                  {history.length > 0 ? (
                    <View style={{ width: "100%", paddingHorizontal: 16 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Text
                          variant="titleSmall"
                          style={{ fontWeight: "bold" }}
                        >
                          Recent Searches
                        </Text>
                        <Button
                          compact
                          onPress={clearHistory}
                          textColor={theme.colors.error}
                        >
                          Clear
                        </Button>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {history.map((term, index) => (
                          <Chip
                            key={index}
                            onPress={() => setQuery(term)}
                            mode="outlined"
                            style={{ marginBottom: 8 }}
                          >
                            {term}
                          </Chip>
                        ))}
                      </View>
                    </View>
                  ) : (
                    // No history, prompt to search
                    <View style={{ alignItems: "center", marginTop: 32 }}>
                      <Text
                        variant="bodyMedium"
                        style={{ color: theme.colors.outline, marginBottom: 8 }}
                      >
                        Search for destinations, activities, or countries.
                      </Text>
                    </View>
                  )}

                  {history.length === 0 && (
                    <MaterialCommunityIcons
                      name="map-search-outline"
                      size={64}
                      color={theme.colors.outline}
                      style={{
                        marginTop: 32,
                        alignSelf: "center",
                        opacity: 0.5,
                      }}
                    />
                  )}
                </>
              ) : (
                // Query exists but no results
                <View style={{ alignItems: "center", marginTop: 32 }}>
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
                </View>
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

      <SortSheet
        visible={showSort}
        onDismiss={() => setShowSort(false)}
        currentSort={filters.sortBy || "rating"}
        onApply={(sort: any) =>
          setFilters((prev) => ({ ...prev, sortBy: sort }))
        }
      />

      <DatePickerModal
        locale="en"
        mode="range"
        visible={openDate}
        onDismiss={onDismissDate}
        startDate={range.startDate}
        endDate={range.endDate}
        onConfirm={onConfirmDate}
      />

      <TravelerSelector
        visible={openTravelers}
        onDismiss={() => setOpenTravelers(false)}
        adults={adults}
        setAdults={setAdults}
        childrenCount={childrenCount}
        setChildren={setChildren}
        infants={infants}
        setInfants={setInfants}
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
    ...shadows.sm,
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
    // alignItems: "center", // Removed to allow left-aligned history logic
    marginTop: 16,
  },
});
