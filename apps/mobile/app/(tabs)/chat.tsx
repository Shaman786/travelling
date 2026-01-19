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
import { borderRadius, shadows, spacing } from "../../src/theme";

const CHAT_OPTIONS = [
  {
    id: "expert",
    title: "Talk to Expert",
    subtitle: "Get personalized travel advice",
    icon: "headset",
    gradient: ["#0056D2", "#4A8FE7"],
    route: "/support/chat",
  },
  {
    id: "booking",
    title: "Booking Support",
    subtitle: "Help with reservations",
    icon: "ticket-confirmation-outline",
    gradient: ["#10B981", "#059669"],
    route: "/support/booking-help",
  },
  {
    id: "visa",
    title: "Visa Assistance",
    subtitle: "Docs & requirements",
    icon: "passport",
    gradient: ["#F5A623", "#E09000"],
    route: "/consult/visa",
  },
  {
    id: "emergency",
    title: "Emergency",
    subtitle: "24/7 assistance",
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
            <Text
              variant="headlineMedium"
              style={[styles.headerTitle, { color: theme.colors.onBackground }]}
            >
              Chat & Support
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              We&apos;re here to help 24/7
            </Text>
          </View>
          <Avatar.Text
            size={48}
            label={user?.name?.substring(0, 2).toUpperCase() || "U"}
            style={{ backgroundColor: theme.colors.primary }}
          />
        </View>

        {/* Chat Options */}
        <View style={styles.section}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            How can we help?
          </Text>
          <View style={styles.optionsGrid}>
            {CHAT_OPTIONS.map((option) => (
              <View
                key={option.id}
                style={[
                  styles.cardContainer,
                  // Apply shadows here for better cross-platform support
                  styles.cardShadow,
                ]}
              >
                <MotiPressable
                  onPress={() => router.push(option.route as any)}
                  animate={animateState}
                  transition={{ type: "spring", damping: 15, stiffness: 400 }}
                  style={[
                    styles.optionCard,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <LinearGradient
                    colors={option.gradient as [string, string]}
                    style={styles.optionGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialCommunityIcons
                      name={option.icon as any}
                      size={28}
                      color="#fff"
                    />
                  </LinearGradient>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.optionTitle,
                      { color: theme.colors.onSurface },
                    ]}
                    numberOfLines={1}
                  >
                    {option.title}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[
                      styles.optionSubtitle,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                    numberOfLines={2}
                  >
                    {option.subtitle}
                  </Text>
                </MotiPressable>
              </View>
            ))}
          </View>
        </View>

        {/* Quick FAQs */}
        <View style={styles.section}>
          <Text
            variant="titleMedium"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            Quick Answers
          </Text>
          <View
            style={[
              styles.faqContainer,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {FAQ_ITEMS.map((faq, index) => (
              <MotiPressable
                key={index}
                onPress={() => router.push("/support/faq" as any)}
                animate={animateState}
                transition={{ type: "spring", damping: 15, stiffness: 400 }}
                style={[
                  styles.faqItem,
                  { borderBottomColor: theme.colors.outlineVariant },
                  index === FAQ_ITEMS.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text
                  variant="bodyMedium"
                  style={[styles.faqText, { color: theme.colors.onSurface }]}
                >
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
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardContainer: {
    width: "48%",
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
  },
  cardShadow: {
    ...shadows.md,
    backgroundColor: "transparent",
  },
  optionCard: {
    width: "100%", // Fill container
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 140,
    overflow: "hidden", // Clip gradient/content
  },
  optionGradient: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  optionTitle: {
    fontWeight: "700",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  faqContainer: {
    // backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.sm,
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f000", // Will rely on theme override in component if needed, or remove border
    gap: spacing.sm,
  },
  faqText: {
    flex: 1,
    // color: colors.textPrimary,
  },
});
