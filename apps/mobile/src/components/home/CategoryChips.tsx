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
import { Text, useTheme } from "react-native-paper";
import { borderRadius, shadows, spacing } from "../../theme";

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
  const theme = useTheme();

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
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Choose Category
        </Text>
        <MotiPressable
          onPress={() => {}}
          animate={animateState}
          transition={{ type: "spring", damping: 15, stiffness: 400 }}
        >
          <Text
            variant="labelLarge"
            style={[styles.seeAll, { color: theme.colors.primary }]}
          >
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
              style={[
                styles.chip,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                },
                isSelected && {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                  ...shadows.accent,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={20}
                color={
                  isSelected ? theme.colors.onPrimary : theme.colors.primary
                }
              />
              <Text
                variant="labelLarge"
                style={[
                  styles.chipText,
                  { color: theme.colors.onSurface },
                  isSelected && { color: theme.colors.onPrimary },
                ]}
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
  },
  seeAll: {
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
    borderWidth: 1.5,
    ...shadows.xs,
  },
  chipText: {
    fontWeight: "600",
  },
});
