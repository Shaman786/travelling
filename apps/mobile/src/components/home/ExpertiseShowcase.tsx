import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Card, Text, useTheme } from "react-native-paper";
import { borderRadius, shadows } from "../../theme";

const SHOWCASE_ITEMS = [
  {
    id: "1",
    title: "Verified Experts",
    subtitle: "Certified travel consultants",
    icon: "check-decagram",
    color: "#4CAF50",
  },
  {
    id: "2",
    title: "24/7 Support",
    subtitle: "Always here for you",
    icon: "face-agent",
    color: "#2196F3",
  },
  {
    id: "3",
    title: "Best Price",
    subtitle: "Guaranteed deals",
    icon: "tag-heart",
    color: "#E91E63",
  },
  {
    id: "4",
    title: "Secure Booking",
    subtitle: "100% safe payments",
    icon: "lock-outline",
    color: "#FF9800",
  },
];

export default function ExpertiseShowcase() {
  const theme = useTheme();

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
        {SHOWCASE_ITEMS.map((item) => (
          <Card
            key={item.id}
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
              <View style={{ flex: 1 }}>
                <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
                  {item.title}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
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
    width: 200,
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
