import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import PackageCard from "../../src/components/PackageCard";
import databaseService from "../../src/lib/databaseService";
import type { TravelPackage } from "../../src/types";

export default function StaysScreen() {
  const theme = useTheme();
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch packages categorized as 'luxury' or just all for demo
        const res = await databaseService.packages.getPackages({
          category: "luxury",
        });
        setPackages(
          res.documents.length > 0
            ? res.documents
            : (await databaseService.packages.getPackages({})).documents
        );
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Curated Stays
        </Text>
        <Text variant="bodyMedium" style={{ color: "#666" }}>
          Handpicked luxury hotels and boutique stays.
        </Text>
      </View>
      <FlatList
        data={packages}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 20 }}>
            <PackageCard item={item} />
          </View>
        )}
        contentContainerStyle={{ padding: 20 }}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  title: { fontWeight: "bold" },
});
