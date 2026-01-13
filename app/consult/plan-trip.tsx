import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { useStore } from "../../src/store/useStore";

export default function PlanTripScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);

  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!destination || !dates) {
      Toast.warn("Please details about your trip.");
      return;
    }
    setLoading(true);
    try {
      // We'll treat this as a Support Ticket for now, or a new Collection "inquiries"
      // For now, let's just log it or simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Toast.success("Request sent! An expert will contact you shortly.");
      router.back();
    } catch (error) {
      Toast.error("Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Plan Your Trip
        </Text>
        <Text variant="bodyMedium" style={{ color: "#666", marginBottom: 24 }}>
          Tell us where you want to go, and our experts will craft a custom
          itinerary for you.
        </Text>

        <TextInput
          label="Destination"
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="Preferred Dates/Duration"
          value={dates}
          onChangeText={setDates}
          style={styles.input}
          placeholder="e.g. Next month, 7 days"
          mode="outlined"
        />
        <TextInput
          label="Budget per person"
          value={budget}
          onChangeText={setBudget}
          style={styles.input}
          keyboardType="numeric"
          mode="outlined"
        />
        <TextInput
          label="Additional Notes / Interests"
          value={notes}
          onChangeText={setNotes}
          style={styles.input}
          multiline
          numberOfLines={4}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: 10 }}
        >
          Get Free Consultation
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontWeight: "bold", marginBottom: 8, color: "#1A1A2E" },
  input: { marginBottom: 16, backgroundColor: "#fff" },
});
