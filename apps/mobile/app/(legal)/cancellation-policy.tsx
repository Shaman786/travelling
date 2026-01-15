/**
 * Cancellation Policy Screen
 *
 * Displays the app's cancellation and refund policy.
 */

import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Divider, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CancellationPolicyScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Cancellation Policy" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Cancellation & Refund Policy
        </Text>
        <Text variant="bodySmall" style={styles.lastUpdated}>
          Last updated: January 2026
        </Text>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            General Cancellation Terms
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We understand that travel plans can change. Our cancellation policy
            is designed to be fair to both our customers and service partners
            while covering operational costs.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Refund Schedule
          </Text>

          <View style={styles.refundItem}>
            <View style={styles.refundRow}>
              <Text variant="bodyMedium" style={styles.timeframe}>
                30+ days before departure
              </Text>
              <Text variant="bodyMedium" style={styles.refundPercent}>
                90% refund
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.refundNote}>
              Full refund minus 10% processing fee
            </Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.refundItem}>
            <View style={styles.refundRow}>
              <Text variant="bodyMedium" style={styles.timeframe}>
                15-30 days before departure
              </Text>
              <Text variant="bodyMedium" style={styles.refundPercent}>
                70% refund
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.refundNote}>
              Partial refund due to advance booking commitments
            </Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.refundItem}>
            <View style={styles.refundRow}>
              <Text variant="bodyMedium" style={styles.timeframe}>
                7-14 days before departure
              </Text>
              <Text variant="bodyMedium" style={styles.refundPercent}>
                50% refund
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.refundNote}>
              Limited refund as services are confirmed
            </Text>
          </View>
          <Divider style={styles.divider} />

          <View style={styles.refundItem}>
            <View style={styles.refundRow}>
              <Text variant="bodyMedium" style={styles.timeframe}>
                Less than 7 days
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.refundPercent, { color: "#F44336" }]}
              >
                No refund
              </Text>
            </View>
            <Text variant="bodySmall" style={styles.refundNote}>
              Full cancellation charges apply
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            How to Cancel
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            To cancel your booking, go to &quot;My Trips&quot; in the app and
            select the trip you wish to cancel. Tap the &quot;Cancel&quot;
            button and confirm your cancellation. Alternatively, contact our
            support team via WhatsApp for assistance.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Non-Refundable Items
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            • Visa processing fees{"\n"}• Travel insurance premiums{"\n"}•
            Special event tickets or experiences marked as non-refundable{"\n"}•
            Administrative and service fees
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Force Majeure
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            In cases of unforeseen circumstances beyond our control (natural
            disasters, pandemics, political unrest, etc.), we will work with you
            to reschedule your trip or provide credits for future travel. Refund
            policies may be adjusted based on supplier policies during such
            events.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Refund Processing
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Approved refunds will be processed within 7-14 business days.
            Refunds will be credited to the original payment method used during
            booking. Please allow additional time for your bank or payment
            provider to reflect the credit.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontWeight: "bold",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  lastUpdated: {
    color: "#666",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "bold",
    color: "#0056D2",
    marginBottom: 12,
  },
  paragraph: {
    color: "#444",
    lineHeight: 22,
  },
  refundItem: {
    paddingVertical: 12,
  },
  refundRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeframe: {
    color: "#1A1A2E",
    fontWeight: "500",
  },
  refundPercent: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  refundNote: {
    color: "#888",
    marginTop: 4,
  },
  divider: {
    marginTop: 12,
  },
});
