/**
 * ExpertiseShowcase Component
 *
 * "Why Book With Us" horizontal cards.
 * Fetches features dynamically from the backend.
 */

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Card, Text, useTheme } from "react-native-paper";
import databaseService from "../../lib/databaseService";
import { borderRadius, shadows } from "../../theme";

interface FeatureItem {
  $id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export default function ExpertiseShowcase() {
  const theme = useTheme();
  const [features, setFeatures] = useState<FeatureItem[]>([]);

  useEffect(() => {
    const loadFeatures = async () => {
      const data = await databaseService.content.getFeatures();
      setFeatures(data);
    };
    loadFeatures();
  }, []);

  if (features.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onBackground }]}
        >
          Why Book With Us?
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {features.map((item) => (
          <Card
            key={item.$id}
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outlineVariant,
                borderRadius: borderRadius.md,
                ...shadows.sm,
              },
            ]}
            mode="contained"
          >
            <Card.Content style={styles.cardContent}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.color + "15" },
                ]}
              >
                <Avatar.Icon
                  size={36}
                  icon={item.icon}
                  color={item.color}
                  style={{ backgroundColor: "transparent" }}
                />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  variant="titleSmall"
                  style={{ fontWeight: "bold" }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.subtitle}
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontWeight: "bold",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingRight: 8,
  },
  card: {
    width: 210,
    marginRight: 12,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  iconContainer: {
    borderRadius: borderRadius.sm,
    padding: 4,
  },
});
