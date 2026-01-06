/**
 * Filter Sheet Component
 *
 * Modal for filtering and sorting packages.
 */

import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  Divider,
  Modal,
  Portal,
  RadioButton,
  Text,
  useTheme,
} from "react-native-paper";

import type { PackageFilters } from "../types";

interface FilterSheetProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (filters: PackageFilters) => void;
  currentFilters: PackageFilters;
}

const CATEGORIES = [
  "Beach",
  "Mountain",
  "City",
  "Adventure",
  "Cultural",
  "Luxury",
];
const SORT_OPTIONS = [
  { label: "Recommended", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest", value: "newest" },
];

export default function FilterSheet({
  visible,
  onDismiss,
  onApply,
  currentFilters,
}: FilterSheetProps) {
  const theme = useTheme();

  const [category, setCategory] = useState<string | undefined>(
    currentFilters.category
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    currentFilters.maxPrice
  );
  const [sortBy, setSortBy] = useState<any>(currentFilters.sortBy || "rating");

  const handleApply = () => {
    onApply({
      category: category?.toLowerCase(),
      maxPrice,
      sortBy,
    });
    onDismiss();
  };

  const handleReset = () => {
    setCategory(undefined);
    setMaxPrice(undefined);
    setSortBy("rating");
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.header}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            Filters & Sort
          </Text>
          <Button compact onPress={handleReset}>
            Reset
          </Button>
        </View>
        <Divider />

        <ScrollView contentContainerStyle={styles.content}>
          {/* Categories */}
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Category
          </Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                selected={category === cat.toLowerCase()}
                onPress={() =>
                  setCategory(
                    category === cat.toLowerCase()
                      ? undefined
                      : cat.toLowerCase()
                  )
                }
                style={styles.chip}
                showSelectedOverlay
              >
                {cat}
              </Chip>
            ))}
          </View>

          {/* Price Range - Simple Buttons for now as Slider needs extra lib */}
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Max Price
          </Text>
          <View style={styles.chipRow}>
            {[500, 1000, 2000, 5000].map((price) => (
              <Chip
                key={price}
                selected={maxPrice === price}
                onPress={() =>
                  setMaxPrice(maxPrice === price ? undefined : price)
                }
                style={styles.chip}
                showSelectedOverlay
              >
                ${price}
              </Chip>
            ))}
          </View>

          {/* Sort By */}
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Sort By
          </Text>
          <RadioButton.Group value={sortBy} onValueChange={(v) => setSortBy(v)}>
            {SORT_OPTIONS.map((opt) => (
              <RadioButton.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
                mode="android"
                position="leading"
                labelStyle={{ textAlign: "left" }}
              />
            ))}
          </RadioButton.Group>
        </ScrollView>

        <Divider />
        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.applyButton}
          >
            Show Results
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderRadius: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "bold",
    marginTop: 8,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginBottom: 4,
  },
  footer: {
    padding: 16,
  },
  applyButton: {
    borderRadius: 8,
  },
});
