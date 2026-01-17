/**
 * Chat/Support Tab
 *
 * Quick access to expert chat and support options
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiPressable } from "moti/interactions";
import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../../src/store/useStore";
import { borderRadius, colors, shadows, spacing } from "../../src/theme";

const CHAT_OPTIONS = [
  {
    id: "expert",
    title: "Talk to Travel Expert",
    subtitle: "Get personalized advice for your trip",
    icon: "headset",
    gradient: ["#0056D2", "#4A8FE7"],
    route: "/support/chat",
  },
  {
    id: "booking",
    title: "Booking Support",
    subtitle: "Help with existing reservations",
    icon: "ticket-confirmation-outline",
    gradient: ["#10B981", "#059669"],
    route: "/support/booking-help",
  },
  {
    id: "visa",
    title: "Visa Assistance",
    subtitle: "Documentation & requirements help",
    icon: "passport",
    gradient: ["#F5A623", "#E09000"],
    route: "/consult/visa",
  },
  {
    id: "emergency",
    title: "Emergency Support",
    subtitle: "24/7 travel emergency assistance",
    icon: "phone-alert",
    gradient: ["#EF4444", "#DC2626"],
    route: "/support/emergency",
  },
];

const FAQ_ITEMS = [
  "How do I cancel my booking?",
  "What documents do I need?",
  "How to modify trip dates?",
  "Refund policy explained",
];

export default function ChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);

  const animateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.97 : 1,
          opacity: pressed ? 0.9 : 1,
        };
      },
    [],
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Chat & Support
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
              We're here to help 24/7
            </Text>
          </View>
          <Avatar.Text
            size={48}
            label={user?.name?.substring(0, 2).toUpperCase() || "U"}
            style={{ backgroundColor: colors.accent }}
          />
        </View>

        {/* Chat Options */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            How can we help?
          </Text>
          <View style={styles.optionsGrid}>
            {CHAT_OPTIONS.map((option) => (
              <MotiPressable
                key={option.id}
                onPress={() => router.push(option.route as any)}
                animate={animateState}
                transition={{ type: "spring", damping: 15, stiffness: 400 }}
                style={styles.optionCard}
              >
                <LinearGradient
                  colors={option.gradient as [string, string]}
                  style={styles.optionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialCommunityIcons
                    name={option.icon as any}
                    size={32}
                    color="#fff"
                  />
                </LinearGradient>
                <Text variant="titleSmall" style={styles.optionTitle}>
                  {option.title}
                </Text>
                <Text variant="bodySmall" style={styles.optionSubtitle}>
                  {option.subtitle}
                </Text>
              </MotiPressable>
            ))}
          </View>
        </View>

        {/* Quick FAQs */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Answers
          </Text>
          <View style={styles.faqContainer}>
            {FAQ_ITEMS.map((faq, index) => (
              <MotiPressable
                key={index}
                onPress={() => router.push("/support/faq" as any)}
                animate={animateState}
                transition={{ type: "spring", damping: 15, stiffness: 400 }}
                style={styles.faqItem}
              >
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text variant="bodyMedium" style={styles.faqText}>
                  {faq}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={theme.colors.outline}
                />
              </MotiPressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  optionCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  optionGradient: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  optionTitle: {
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionSubtitle: {
    color: colors.textSecondary,
  },
  faqContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.sm,
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    gap: spacing.sm,
  },
  faqText: {
    flex: 1,
    color: colors.textPrimary,
  },
});
