import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function InsuranceScreen() {
  const theme = useTheme();
  const router = useRouter();

  const handleBuy = () => {
    // In a real app, this would add insurance to the current booking draft
    // For now, we'll route to support to request a quote
    Toast.success("Request sent! An agent will contact you shortly.");
    router.push({
      pathname: "/support/create",
      params: { subject: "Travel Insurance Quote Request" },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Travel Insurance
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 20, color: "#666" }}>
          Protect your trip against cancellations and medical emergencies.
        </Text>

        <Card style={{ marginBottom: 16 }}>
          <Card.Title title="Comprehensive Plan" subtitle="$49 / person" />
          <Card.Content>
            <Text>• Medical Coverage up to $100k</Text>
            <Text>• Trip Cancellation</Text>
            <Text>• Lost Baggage</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={handleBuy}>Select Plan</Button>
          </Card.Actions>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontWeight: "bold", marginBottom: 8 },
});
