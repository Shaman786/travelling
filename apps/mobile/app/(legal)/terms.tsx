/**
 * Terms and Conditions Screen
 *
 * Displays the app's terms and conditions.
 */

import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TermsScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Terms and Conditions" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>
          Terms and Conditions
        </Text>
        <Text variant="bodySmall" style={styles.lastUpdated}>
          Last updated: January 2026
        </Text>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            1. Acceptance of Terms
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            By accessing and using the Travelling app, you accept and agree to
            be bound by the terms and provisions of this agreement. If you do
            not agree to abide by these terms, please do not use this service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            2. Booking and Payments
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            All bookings made through our platform are subject to availability
            and confirmation. Payment must be made in full at the time of
            booking unless otherwise specified. We accept major credit cards and
            other payment methods as indicated during checkout.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            3. User Responsibilities
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Users are responsible for ensuring that all information provided
            during booking is accurate and complete. This includes but is not
            limited to traveler names, passport details, and contact
            information. Incorrect information may result in denied boarding or
            cancellation of services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            4. Privacy Policy
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Your privacy is important to us. We collect and use personal
            information only as needed to provide our services. Your data is
            securely stored and never shared with third parties without your
            consent, except as required by law.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            5. Limitation of Liability
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            Travelling acts as an intermediary between users and travel service
            providers. We are not liable for any loss, damage, or inconvenience
            caused by service providers, including but not limited to airlines,
            hotels, and tour operators.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            6. Modifications to Terms
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Changes will
            be effective immediately upon posting. Continued use of the app
            after modifications constitutes acceptance of the updated terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            7. Contact Us
          </Text>
          <Text variant="bodyMedium" style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, please
            contact us at support@travelling.app or through our in-app support
            feature.
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
    marginBottom: 8,
  },
  paragraph: {
    color: "#444",
    lineHeight: 22,
  },
});
