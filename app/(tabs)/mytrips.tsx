import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Divider,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import StepTracker from "../../src/components/StepTracker";
import { BookedTrip, useStore } from "../../src/store/useStore";

export default function MyTripsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const bookedTrips = useStore((state) => state.bookedTrips);

  const handleCancelTrip = (tripId: string) => {
    Toast.info("Cancellation coming soon!");
  };

  const renderEmptyState = () => (
    <View style={styles.center}>
      <MaterialCommunityIcons
        name="bag-suitcase-off"
        size={64}
        color={theme.colors.outlineVariant}
      />
      <Text
        variant="headlineSmall"
        style={{ marginTop: 16, color: theme.colors.onSurfaceVariant }}
      >
        No upcoming trips
      </Text>
      <Text
        variant="bodyMedium"
        style={{
          marginTop: 8,
          textAlign: "center",
          color: theme.colors.outline,
        }}
      >
        Your next adventure is waiting.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.push("/(tabs)")}
        style={{ marginTop: 24, borderRadius: 8 }}
        contentStyle={{ height: 48 }}
      >
        Book Now
      </Button>
    </View>
  );

  const renderTripItem = ({ item: trip }: { item: BookedTrip }) => {
    // Determine visual status color
    let statusColor = theme.colors.primary;
    if (trip.status === "visa_approved") statusColor = "#2196F3"; // Blue
    if (trip.status === "ready_to_fly" || trip.status === "completed")
      statusColor = "#4CAF50"; // Green

    // Format Status Text
    const statusText = trip.status
      .split("_")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return (
      <Card style={styles.card} mode="elevated">
        {/* Header with Image if available - keeping simple text header for now based on mock data */}
        <View
          style={[
            styles.cardHeader,
            {
              borderBottomColor: theme.colors.outlineVariant,
              borderBottomWidth: 0.5,
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              {trip.packageTitle}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              {format(
                new Date(trip.departureDate || Date.now()),
                "MMM dd, yyyy"
              )}{" "}
              • {trip.destination}
            </Text>
          </View>
          <Chip
            icon="information"
            style={{ backgroundColor: statusColor + "20" }}
            textStyle={{ color: statusColor, fontSize: 12 }}
          >
            {statusText}
          </Chip>
        </View>

        <Card.Content style={{ paddingTop: 16 }}>
          {/* Use StepTracker for visual progress */}
          <StepTracker currentStatus={trip.status} />

          <Divider style={{ marginVertical: 12 }} />

          <View style={styles.actions}>
            <View>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Total Paid
              </Text>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", color: theme.colors.primary }}
              >
                ${trip.totalPrice}
              </Text>
            </View>

            <Button
              mode="outlined"
              compact
              textColor={theme.colors.error}
              style={{ borderColor: theme.colors.errorContainer }}
              onPress={() => handleCancelTrip(trip.id)}
            >
              Cancel
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          My Trips
        </Text>
      </View>

      <FlatList
        data={[...bookedTrips].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={renderTripItem}
        contentContainerStyle={
          bookedTrips.length === 0 ? { flex: 1 } : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontWeight: "bold",
    color: "#0056D2",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#fafafa",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
