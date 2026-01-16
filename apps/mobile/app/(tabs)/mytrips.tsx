import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";
import { Image } from "expo-image"; // Added Image import
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Share, StyleSheet, View } from "react-native";
import { useNavigationMode } from "react-native-navigation-mode";
import {
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import ReviewModal from "../../src/components/ReviewModal";
import StepTracker from "../../src/components/StepTracker";
import { usePayment } from "../../src/hooks/usePayment";
import { bookingService } from "../../src/lib/databaseService";
import { BookedTrip, useStore } from "../../src/store/useStore";
import { borderRadius, shadows } from "../../src/theme";

export default function MyTripsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets(); // Fix: Define insets
  const { navigationMode } = useNavigationMode();
  const bottomPadding =
    120 + (navigationMode?.navigationBarHeight ?? insets.bottom);

  const router = useRouter();
  const bookedTrips = useStore((state) => state.bookedTrips);
  const updateBookedTrip = useStore((state) => state.updateBookedTrip);
  const setBookedTrips = useStore((state) => state.setBookedTrips);
  const addBookedTrip = useStore((state) => state.addBookedTrip);
  const user = useStore.getState().user; // Get user ID

  // --- State for Filtering ---
  const [activeSegment, setActiveSegment] = useState<
    "upcoming" | "completed" | "cancelled"
  >("upcoming");

  // --- State for Adding Trip ---
  const [isAddTripVisible, setIsAddTripVisible] = useState(false);
  const [addTripId, setAddTripId] = useState("");
  const [isAddingTrip, setIsAddingTrip] = useState(false);

  // Auto-refresh to ensure payment status is up to date
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const fetchLatestBookings = async () => {
        if (!user?.$id) return;
        try {
          // Fetch latest from DB to ensure status is up to date
          const bookings = await bookingService.getUserBookings(user.$id); // Use bookingService
          if (isActive && bookings) {
            setBookedTrips(bookings);
          }
        } catch (error) {
          console.log("Failed to refresh bookings:", error);
        }
      };

      fetchLatestBookings();

      return () => {
        isActive = false;
      };
    }, [user?.$id, setBookedTrips])
  );

  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [currentReviewTrip, setCurrentReviewTrip] = useState<BookedTrip | null>(
    null
  );

  const { startPayment, isProcessing } = usePayment();
  const [payingTripId, setPayingTripId] = useState<string | null>(null);

  // --- Filtered Trips Logic ---
  const filteredTrips = bookedTrips
    .filter((trip) => {
      if (activeSegment === "upcoming") {
        return [
          "processing",
          "visa_submitted",
          "visa_approved",
          "ready_to_fly",
          "pending_payment",
        ].includes(trip.status);
      } else if (activeSegment === "completed") {
        return trip.status === "completed";
      } else if (activeSegment === "cancelled") {
        return ["cancelled", "refunded", "failed"].includes(trip.status);
      }
      return false;
    })
    .sort(
      (a, b) =>
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );

  // --- Handlers ---
  const handleAddTrip = async () => {
    if (!addTripId.trim()) {
      Toast.warn("Please enter a Booking ID");
      return;
    }

    setIsAddingTrip(true);
    try {
      const booking = await bookingService.getBookingById(addTripId.trim());
      if (booking) {
        addBookedTrip(booking);
        Toast.success("Trip added successfully!");
        setIsAddTripVisible(false);
        setAddTripId("");
      } else {
        Toast.error("Booking not found");
      }
    } catch (error: any) {
      console.error("Add trip error:", error);
      Toast.error("Failed to add trip: " + error.message);
    } finally {
      setIsAddingTrip(false);
    }
  };

  const handleOpenReview = (trip: BookedTrip) => {
    setCurrentReviewTrip(trip);
    setIsReviewModalVisible(true);
  };

  const handlePayNow = async (trip: BookedTrip) => {
    setPayingTripId(trip.id);
    try {
      // 1. Start UI Flow
      const result = await startPayment(trip.id, trip.totalPrice);

      // 2. Handle Result
      if (result.success && result.paymentIntentId) {
        Toast.success("Payment Authorized. Confirming...");

        // 3. Record Transaction in DB (Atomic)
        await bookingService.confirmBookingPayment(
          trip.id,
          result.paymentIntentId
        );

        Toast.success("Booking Confirmed! ✅");

        // 4. Force Refresh to update UI immediately
        if (user?.$id) {
          const bookings = await bookingService.getUserBookings(user.$id);
          setBookedTrips(bookings);
        }
      } else if (result.status === "cancelled") {
        Toast.warn("Payment Cancelled");
      } else {
        Toast.error(result.error || "Payment Failed");
      }
    } catch (error: any) {
      console.error("Payment Confirmation Error:", error);
      Toast.error("Payment recorded failed: " + error.message);
    } finally {
      setPayingTripId(null);
    }
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
          onPress: async () => {
            try {
              // 1. Call Backend
              await bookingService.cancelBooking(
                tripId,
                "Cancelled by user via app"
              );

              // 2. Update Local Store
              updateBookedTrip(tripId, { status: "cancelled" });

              Toast.success("Trip cancelled successfully");
            } catch (error: any) {
              console.error("Cancel Error:", error);
              Toast.error("Failed to cancel trip: " + error.message);
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (tripId: string) => {
    router.push(`/bookings/${tripId}` as any);
  };

  const handleShareTrip = async (trip: BookedTrip) => {
    try {
      const message = `Check out my trip to ${trip.destination || trip.packageTitle}! I booked it on Host-Palace App.`;
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleBookAgain = (packageId: string) => {
    router.push(`/details/${packageId}` as any);
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
    // VISUAL STATUS HELPERS
    let statusColor = theme.colors.primary;
    let statusText = trip.status
      .split("_")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    if (trip.status === "processing") {
      if (trip.paymentStatus === "paid") {
        statusText = "Paid - Processing";
        statusColor = "#4CAF50";
      } else {
        statusText = "Awaiting Confirmation";
        statusColor = "#FF9800";
      }
    } else if (
      trip.status === "visa_approved" ||
      trip.status === "ready_to_fly" ||
      trip.status === "completed"
    ) {
      statusColor = "#4CAF50";
    } else if (
      (trip.status as string) === "cancelled" ||
      (trip.status as string) === "refunded" ||
      (trip.status as string) === "failed"
    ) {
      statusText =
        (trip.status as string) === "refunded" ? "Refunded" : "Cancelled";
      statusColor = theme.colors.error;
    } else if (trip.status === "visa_submitted") {
      statusText = "Visa Submitted";
      statusColor = "#2196F3";
    }

    // DATE HELPER
    const displayDate = (() => {
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
    })();

    // === COMPACT CARD (For Completed / Cancelled) ===
    if (activeSegment !== "upcoming") {
      return (
        <Pressable
          onPress={() => handleViewDetails(trip.id)}
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <View
            style={[
              styles.compactCard,
              { borderLeftColor: statusColor, borderLeftWidth: 4 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
                {trip.packageTitle}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {displayDate} • {trip.destination}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Chip
                textStyle={{
                  fontSize: 10,
                  color: statusColor,
                  lineHeight: 12,
                }}
                style={{
                  backgroundColor: statusColor + "15",
                  height: 24,
                  marginBottom: 4,
                }}
                compact
              >
                {statusText}
              </Chip>
              {activeSegment === "completed" && (
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable onPress={() => handleOpenReview(trip)} hitSlop={8}>
                    <Text
                      variant="labelSmall"
                      style={{
                        color: theme.colors.primary,
                        fontWeight: "bold",
                      }}
                    >
                      Review
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => handleShareTrip(trip)} hitSlop={8}>
                    <Text
                      variant="labelSmall"
                      style={{
                        color: theme.colors.secondary,
                        fontWeight: "bold",
                      }}
                    >
                      Share
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleBookAgain(trip.packageId)}
                    hitSlop={8}
                  >
                    <Text
                      variant="labelSmall"
                      style={{
                        color: theme.colors.primary,
                        fontWeight: "bold",
                      }}
                    >
                      Book Again
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      );
    }

    // === FULL CARD (For Upcoming / Ongoing) ===
    return (
      <Pressable
        onPress={() => handleViewDetails(trip.id)}
        style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]}
      >
        <Card style={styles.card} mode="elevated">
          {/* Header Image Background Style */}
          <View style={{ position: "relative" }}>
            {trip.packageImageUrl && (
              <Image
                source={{ uri: trip.packageImageUrl }}
                style={styles.cardHeroImage}
                contentFit="cover"
              />
            )}
            <View style={styles.cardOverlay}>
              <View style={styles.statusBadgeRow}>
                <Chip
                  icon="information"
                  style={{ backgroundColor: "#ffffff" }}
                  textStyle={{ color: statusColor, fontWeight: "bold" }}
                >
                  {statusText}
                </Chip>
              </View>
            </View>
          </View>

          <Card.Content style={{ paddingTop: 16 }}>
            <View style={{ marginBottom: 16 }}>
              <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
                {trip.packageTitle}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.secondary }}
              >
                {displayDate} • {trip.destination}
              </Text>
            </View>

            {/* Step Tracker */}
            <StepTracker currentStatus={trip.status} />

            <Divider style={{ marginVertical: 16 }} />

            <View style={styles.actions}>
              <View>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.outline }}
                >
                  Amount Paid
                </Text>
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "bold", color: theme.colors.primary }}
                >
                  ${trip.totalPrice}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {trip.status === "pending_payment" ? (
                  <>
                    <Button
                      mode="outlined"
                      compact
                      textColor={theme.colors.error}
                      style={{ borderColor: theme.colors.errorContainer }}
                      onPress={() =>
                        handleCancelTrip(trip.id, trip.packageTitle)
                      }
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
                  </>
                ) : (
                  <Button
                    mode="contained-tonal"
                    compact
                    icon="eye"
                    onPress={() => handleViewDetails(trip.id)}
                  >
                    Manage
                  </Button>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </Pressable>
    );
  };

  // Debug logging
  console.log(
    "MyTrips Render. Review Modal Visible:",
    isReviewModalVisible,
    "Trip:",
    currentReviewTrip?.id
  );

  // --- Dynamic Segments Logic ---
  const hasUpcoming = bookedTrips.some((t) =>
    [
      "processing",
      "visa_submitted",
      "visa_approved",
      "ready_to_fly",
      "pending_payment",
    ].includes(t.status)
  );
  const hasCompleted = bookedTrips.some((t) => t.status === "completed");
  const hasCancelled = bookedTrips.some((t) =>
    ["cancelled", "refunded", "failed"].includes(t.status)
  );

  const segments = React.useMemo(
    () => [
      ...(hasUpcoming || (!hasCompleted && !hasCancelled)
        ? [{ value: "upcoming", label: "Upcoming" }]
        : []),
      ...(hasCompleted ? [{ value: "completed", label: "Completed" }] : []),
      ...(hasCancelled ? [{ value: "cancelled", label: "Cancelled" }] : []),
    ],
    [hasUpcoming, hasCompleted, hasCancelled]
  );

  // Set Header Button dynamically
  const navigation = useNavigation();
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setIsAddTripVisible(true)}
          hitSlop={10}
          style={{ marginRight: 16 }}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            size={28}
            color={theme.colors.primary}
          />
        </Pressable>
      ),
    });
  }, [navigation, theme.colors.primary]);

  // Effect to ensure activeSegment is valid
  React.useEffect(() => {
    const isValid = segments.some((s) => s.value === activeSegment);
    if (!isValid && segments.length > 0) {
      setActiveSegment(segments[0].value as any);
    }
  }, [segments, activeSegment]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]}
    >
      {/* Search Bar Removed from here as it's in Header now */}

      {/* Segmented Buttons if Needed */}
      <View style={styles.header}>
        {/* Title hidden if using Tab Header title "My Trips" */}
        {/* But if we keep this inline header, we might have double headers. */}
        {/* Assuming default Tab Header is shown: */}
        {/* Adjust layout if Tab Header is present */}
        {segments.length > 1 && (
          <SegmentedButtons
            value={activeSegment}
            onValueChange={(val) => setActiveSegment(val as any)}
            buttons={segments}
            // style={{ marginTop: 16 }} // Removed margin top as title is likely handled by Tab Header
            density="medium"
          />
        )}
      </View>

      <FlashList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={renderTripItem}
        contentContainerStyle={[
          filteredTrips.length === 0
            ? { flexGrow: 1, justifyContent: "center" }
            : styles.listContent,
          { paddingBottom: bottomPadding },
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <Portal>
        <Dialog
          visible={isAddTripVisible}
          onDismiss={() => setIsAddTripVisible(false)}
        >
          <Dialog.Title>Add Trip by ID</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              Enter the Booking ID provided to you to add it to your list.
            </Text>
            <TextInput
              label="Booking ID"
              value={addTripId}
              onChangeText={setAddTripId}
              mode="outlined"
              autoCapitalize="none"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsAddTripVisible(false)}>Cancel</Button>
            <Button
              onPress={handleAddTrip}
              loading={isAddingTrip}
              disabled={isAddingTrip || !addTripId}
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {currentReviewTrip && (
        <ReviewModal
          visible={isReviewModalVisible}
          onDismiss={() => setIsReviewModalVisible(false)}
          bookingId={currentReviewTrip.id}
          packageId={currentReviewTrip.packageId}
          packageTitle={currentReviewTrip.packageTitle}
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
    // flex: 1, // Removed to rely on parent centering
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    ...shadows.sm,
  },
  title: {
    fontWeight: "bold",
    color: "#0056D2",
  },
  listContent: {
    padding: 16,
    paddingBottom: 140,
  },
  card: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: borderRadius.md,
    overflow: "hidden",
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fafafa",
    gap: 12,
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
    flexWrap: "wrap",
    gap: 12,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  // New Styles for Refactored Cards
  compactCard: {
    backgroundColor: "#fff",
    borderRadius: borderRadius.sm,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.sm,
    borderLeftWidth: 4, // Make sure to override in style prop if needed
  },
  cardHeroImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#eee",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  statusBadgeRow: {
    alignSelf: "flex-end",
  },
});
