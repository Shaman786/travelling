import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";
import { Image } from "expo-image"; // Added Image import
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
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
import ReviewModal from "../../src/components/ReviewModal";
import StepTracker from "../../src/components/StepTracker";
import { usePayment } from "../../src/hooks/usePayment"; // Added usePayment import
import { BookedTrip, useStore } from "../../src/store/useStore";

export default function MyTripsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const bookedTrips = useStore((state) => state.bookedTrips);
  const removeBookedTrip = useStore((state) => state.removeBookedTrip);

  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedTripForReview, setSelectedTripForReview] =
    useState<BookedTrip | null>(null);

  const { startPayment, isProcessing } = usePayment();
  const [payingTripId, setPayingTripId] = useState<string | null>(null);

  const handleOpenReview = (trip: BookedTrip) => {
    setSelectedTripForReview(trip);
    setIsReviewModalVisible(true);
  };

  const handlePayNow = async (trip: BookedTrip) => {
    setPayingTripId(trip.id);
    const success = await startPayment(trip.id, trip.totalPrice);
    if (success) {
      // Optimistically update status or reload
      // removeBookedTrip(trip.id); // Or update status
      Toast.success("Payment Successful! Processing booking...");
    }
    setPayingTripId(null);
  };

  const handleCancelTrip = (tripId: string, tripTitle: string) => {
    Alert.alert(
      "Cancel Trip",
      `Are you sure you want to cancel "${tripTitle}"? This action cannot be undone.`,
      [
        { text: "Keep Trip", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            removeBookedTrip(tripId);
            Toast.success("Trip cancelled successfully");
          },
        },
      ]
    );
  };

  const handleViewDetails = (tripId: string) => {
    router.push(`/bookings/${tripId}` as any);
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
      <Pressable
        onPress={() => handleViewDetails(trip.id)}
        style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
      >
        <Card style={styles.card} mode="elevated">
          <View style={styles.cardHeader}>
            {/* Image Section */}
            {trip.packageImageUrl && (
              <Image
                source={{ uri: trip.packageImageUrl }}
                style={styles.cardImage}
                contentFit="cover"
              />
            )}
            <View style={styles.cardHeaderTextContainer}>
              <View style={styles.cardTitleRow}>
                <Text
                  variant="titleMedium"
                  style={styles.cardTitle}
                  numberOfLines={1}
                >
                  {trip.packageTitle}
                </Text>
                <Chip
                  icon="information"
                  style={{ backgroundColor: statusColor + "20", height: 28 }}
                  textStyle={{
                    color: statusColor,
                    fontSize: 10,
                    lineHeight: 10,
                  }}
                  compact
                >
                  {statusText}
                </Chip>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {(() => {
                  try {
                    const date = trip.departureDate
                      ? new Date(trip.departureDate)
                      : new Date();
                    return isNaN(date.getTime())
                      ? "Date TBD"
                      : format(date, "MMM dd, yyyy");
                  } catch {
                    return "Date TBD";
                  }
                })()}{" "}
                • {trip.destination}
              </Text>
            </View>
          </View>

          <Card.Content style={{ paddingTop: 16 }}>
            {/* Use StepTracker for visual progress */}
            <StepTracker currentStatus={trip.status} />

            <Divider style={{ marginVertical: 12 }} />

            <View style={styles.actions}>
              <View>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.outline }}
                >
                  Total Paid
                </Text>
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "bold", color: theme.colors.primary }}
                >
                  ${trip.totalPrice}
                </Text>
              </View>

              {/* Actions based on status */}
              {trip.status === "pending_payment" ? (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button
                    mode="outlined"
                    compact
                    textColor={theme.colors.error}
                    style={{ borderColor: theme.colors.errorContainer }}
                    onPress={() => handleCancelTrip(trip.id, trip.packageTitle)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    compact
                    loading={isProcessing && payingTripId === trip.id}
                    disabled={isProcessing}
                    onPress={() => handlePayNow(trip)}
                  >
                    Pay Now
                  </Button>
                </View>
              ) : trip.status === "completed" ||
                trip.status === "ready_to_fly" ? (
                <Button
                  mode="contained"
                  compact
                  buttonColor={theme.colors.secondary}
                  onPress={() => handleOpenReview(trip)}
                  icon="star"
                >
                  Review
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  compact
                  textColor={theme.colors.error}
                  style={{ borderColor: theme.colors.errorContainer }}
                  onPress={() => handleCancelTrip(trip.id, trip.packageTitle)}
                >
                  Cancel
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>
      </Pressable>
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

      <FlashList
        data={[...bookedTrips].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={renderTripItem}
        contentContainerStyle={
          bookedTrips.length === 0 ? { flex: 1 } : styles.listContent
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {selectedTripForReview && (
        <ReviewModal
          visible={isReviewModalVisible}
          onDismiss={() => setIsReviewModalVisible(false)}
          bookingId={selectedTripForReview.id}
          packageId={selectedTripForReview.packageId}
          packageTitle={selectedTripForReview.packageTitle}
          onSuccess={() => {
            // Refresh trips or update UI if needed
            // In a real app, we might mark this trip as reviewed to hide the button
          }}
        />
      )}
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
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fafafa",
    gap: 12, // Added gap
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  cardHeaderTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
    gap: 8,
  },
  cardTitle: {
    fontWeight: "bold",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
