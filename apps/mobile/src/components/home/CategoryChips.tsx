/**
 * CategoryChips Component
 *
 * Horizontal scrolling category filter chips for travel types.
 * Beach, Mountain, Adventure, Cultural, etc.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MotiPressable } from "moti/interactions";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { borderRadius, colors, shadows, spacing } from "../../theme";

const CATEGORIES = [
  { id: "all", name: "All", icon: "compass-rose" },
  { id: "beach", name: "Beach", icon: "beach" },
  { id: "mountain", name: "Mountain", icon: "image-filter-hdr" },
  { id: "adventure", name: "Adventure", icon: "hiking" },
  { id: "cultural", name: "Cultural", icon: "bank" },
  { id: "honeymoon", name: "Honeymoon", icon: "heart" },
  { id: "family", name: "Family", icon: "account-group" },
];

interface CategoryChipsProps {
  onSelect?: (category: string) => void;
  selectedCategory?: string;
}

export default function CategoryChips({
  onSelect,
  selectedCategory = "all",
}: CategoryChipsProps) {
  const [selected, setSelected] = useState(selectedCategory);

  const animateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.95 : 1,
        };
      },
    [],
  );

  const handlePress = (categoryId: string) => {
    setSelected(categoryId);
    onSelect?.(categoryId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Choose Category
        </Text>
        <MotiPressable
          onPress={() => {}}
          animate={animateState}
          transition={{ type: "spring", damping: 15, stiffness: 400 }}
        >
          <Text variant="labelLarge" style={styles.seeAll}>
            See all
          </Text>
        </MotiPressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selected === category.id;
          return (
            <MotiPressable
              key={category.id}
              onPress={() => handlePress(category.id)}
              animate={animateState}
              transition={{ type: "spring", damping: 15, stiffness: 400 }}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={20}
                color={isSelected ? colors.textInverse : colors.accent}
              />
              <Text
                variant="labelLarge"
                style={[styles.chipText, isSelected && styles.chipTextSelected]}
              >
                {category.name}
              </Text>
            </MotiPressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontWeight: "600",
    color: colors.textPrimary,
  },
  seeAll: {
    color: colors.accent,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.accent,
    ...shadows.xs,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    ...shadows.accent,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: colors.textInverse,
  },
});
