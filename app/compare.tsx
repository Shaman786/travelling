import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Divider,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import databaseService from "../src/lib/databaseService";
import { useStore } from "../src/store/useStore";
import type { TravelPackage } from "../src/types";

export default function CompareScreen() {
  const theme = useTheme();
  const router = useRouter();
  const comparisonList = useStore((state) => state.comparisonList);
  const clearComparison = useStore((state) => state.clearComparison);
  const removeFromComparison = useStore((state) => state.removeFromComparison);

  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, [comparisonList]);

  const loadPackages = async () => {
    if (comparisonList.length === 0) {
      setPackages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch each package details
      const promises = comparisonList.map((id) =>
        databaseService.packages.getPackageById(id)
      );
      const results = await Promise.all(promises);
      setPackages(results.filter((p): p is TravelPackage => p !== null));
    } catch (error) {
      console.error("Failed to load comparison packages", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (packages.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Compare Packages" />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="scale-balance"
            size={64}
            color={theme.colors.outline}
          />
          <Text variant="titleMedium" style={{ marginTop: 16 }}>
            No packages selected
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={{ marginTop: 24 }}
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Compare Packages" />
        <Appbar.Action icon="delete-sweep" onPress={clearComparison} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.comparisonRow}>
          {packages.map((pkg, index) => (
            <View key={pkg.$id} style={styles.packageColumn}>
              {/* Header / Image */}
              <Card style={styles.card}>
                <Image
                  source={{ uri: pkg.imageUrl }}
                  style={{ height: 120 }}
                  contentFit="cover"
                />
                <Card.Content style={{ paddingVertical: 8 }}>
                  <Text
                    variant="titleSmall"
                    numberOfLines={2}
                    style={{ fontWeight: "bold", height: 40 }}
                  >
                    {pkg.title}
                  </Text>
                  <Button
                    mode="text"
                    compact
                    textColor={theme.colors.error}
                    onPress={() => removeFromComparison(pkg.$id)}
                  >
                    Remove
                  </Button>
                </Card.Content>
              </Card>

              {/* Attributes */}
              <View style={styles.attributes}>
                <Divider />
                <Attribute label="Price" value={`$${pkg.price}`} />
                <Divider />
                <Attribute label="Duration" value={pkg.duration} />
                <Divider />
                <Attribute label="Destination" value={pkg.destination} />
                <Divider />
                <Attribute label="Rating" value={`${pkg.rating} ⭐`} />
                <Divider />
                <Attribute
                  label="Description"
                  value={pkg.description}
                  numberOfLines={4}
                />
                <Divider />
                <View style={{ padding: 12 }}>
                  <Button
                    mode="contained"
                    onPress={() => router.push(`/details/${pkg.$id}`)}
                  >
                    View
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Attribute = ({
  label,
  value,
  numberOfLines = 1,
}: {
  label: string;
  value: string | number;
  numberOfLines?: number;
}) => (
  <View style={styles.attributeContainer}>
    <Text variant="labelSmall" style={{ color: "#888" }}>
      {label}
    </Text>
    <Text variant="bodyMedium" numberOfLines={numberOfLines}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollContent: {
    padding: 10,
  },
  comparisonRow: {
    flexDirection: "row",
    gap: 10,
  },
  packageColumn: {
    flex: 1,
  },
  card: {
    marginBottom: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  attributes: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  attributeContainer: {
    padding: 12,
    minHeight: 60,
    justifyContent: "center",
  },
});
