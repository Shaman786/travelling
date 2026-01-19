import { Stack } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacyPolicyScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <Stack.Screen options={{ title: "Privacy Policy" }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.primary }]}
        >
          Privacy Policy
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.text, { color: theme.colors.onSurface }]}
        >
          Last updated: January 2026
        </Text>

        <Text
          variant="titleMedium"
          style={[styles.heading, { color: theme.colors.onSurface }]}
        >
          1. Information We Collect
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.text, { color: theme.colors.onSurfaceVariant }]}
        >
          We collect information you provide directly to us, such as when you
          create or modify your account, request on-demand services, contact
          customer support, or otherwise communicate with us.
        </Text>

        <Text
          variant="titleMedium"
          style={[styles.heading, { color: theme.colors.onSurface }]}
        >
          2. How We Use Your Information
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.text, { color: theme.colors.onSurfaceVariant }]}
        >
          We use the information we collect to provide, maintain, and improve
          our services, such as to process payments, verify your identity, and
          personalize your experience.
        </Text>

        <Text
          variant="titleMedium"
          style={[styles.heading, { color: theme.colors.onSurface }]}
        >
          3. Sharing of Information
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.text, { color: theme.colors.onSurfaceVariant }]}
        >
          We may share the information we collect about you as described in this
          Statement or as described at the time of collection or sharing,
          including with third party service providers.
        </Text>
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
    paddingBottom: 40,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  heading: {
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    lineHeight: 22,
  },
});
