/**
 * Favorites Screen
 *
 * Displays user's favorite packages.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import PackageCard from "../../src/components/PackageCard";
import databaseService from "../../src/lib/databaseService";
import { useStore } from "../../src/store/useStore";
import type { TravelPackage } from "../../src/types";

export default function FavoritesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const favoriteIds = useStore((state) => state.favoritePackages);
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await databaseService.packages.getPackages({
        ids: favoriteIds,
      });
      setPackages(response.documents);
    } catch {
      // Quiet fail
    } finally {
      setIsLoading(false);
    }
  }, [favoriteIds]);

  useEffect(() => {
    if (favoriteIds.length > 0) {
      loadFavorites();
    } else {
      setPackages([]);
    }
  }, [favoriteIds, loadFavorites]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="My Favorites" />
      </Appbar.Header>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={packages}
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
              <MaterialCommunityIcons
                name="heart-broken"
                size={64}
                color={theme.colors.outline}
              />
              <Text
                variant="headlineSmall"
                style={{ marginTop: 16, color: theme.colors.outline }}
              >
                No favorites yet
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.outline,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                Save packages you like to find them here later.
              </Text>
              <Button
                mode="contained"
                onPress={() => router.push("/")}
                style={{ marginTop: 24 }}
              >
                Explore Packages
              </Button>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 32,
  },
});
