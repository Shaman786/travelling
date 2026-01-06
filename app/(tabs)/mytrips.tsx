import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Appbar, List, Surface, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import StepTracker from "../../src/components/StepTracker";
import { useStore } from "../../src/store/useStore";

// Creating some mock booked trips for visualization if none exist
const mockBookedTrips = [
  {
    id: "booking_123",
    packageId: "pkg_kerala_bliss",
    packageTitle: "Kerala Backwater Bliss",
    destination: "India",
    status: "visa_approved",
    departureDate: new Date("2024-04-15"),
    totalPrice: 899,
  },
  {
    id: "booking_456",
    packageId: "pkg_dubai_luxury",
    packageTitle: "Dubai Luxury Escape",
    destination: "Gulf",
    status: "processing",
    departureDate: new Date("2024-06-20"),
    totalPrice: 1698,
  },
];

export default function MyTripsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);

  // In a real app we'd use useStore(state => state.bookedTrips)
  // defaulting to mock data for the demo
  const bookedTrips = mockBookedTrips;

  const getStatusSteps = (status: string) => {
    const steps = [
      { title: "Booking Confirmed", status: "completed" },
      { title: "Documents Verified", status: "upcoming" },
      { title: "Visa Submitted", status: "upcoming" },
      { title: "Visa Approved", status: "upcoming" },
      { title: "Ready to Fly", status: "upcoming" },
    ];

    let currentIndex = 0;
    switch (status) {
      case "processing":
        currentIndex = 0;
        break;
      case "documents_verified":
        currentIndex = 1;
        break;
      case "visa_submitted":
        currentIndex = 2;
        break;
      case "visa_approved":
        currentIndex = 3;
        break;
      case "ready_to_fly":
        currentIndex = 4;
        break;
      case "completed":
        currentIndex = 5;
        break;
    }

    return steps.map((step, index) => {
      if (index < currentIndex)
        return { ...step, status: "completed" as const };
      if (index === currentIndex)
        return { ...step, status: "current" as const };
      return step;
    });
  };

  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
        <Appbar.Content title="My Trips" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {bookedTrips.map((trip) => (
          <Surface key={trip.id} style={styles.card} elevation={2}>
            <List.Accordion
              title={trip.packageTitle}
              description={`${
                trip.destination
              } • ${trip.departureDate.toLocaleDateString()}`}
              expanded={expandedId === trip.id}
              onPress={() => toggleExpand(trip.id)}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon="airplane"
                  color={theme.colors.primary}
                />
              )}
              style={styles.accordionHeader}
              titleStyle={styles.cardTitle}
            >
              <View style={styles.trackerContainer}>
                <Text variant="titleMedium" style={styles.trackerTitle}>
                  Status Tracking
                </Text>
                <StepTracker steps={getStatusSteps(trip.status)} />
              </View>
            </List.Accordion>
          </Surface>
        ))}

        {bookedTrips.length === 0 && (
          <View style={styles.emptyState}>
            <Text>No trips booked yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  accordionHeader: {
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  trackerContainer: {
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  trackerTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 40,
  },
});
