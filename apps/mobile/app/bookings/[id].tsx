/**
 * Booking Details Screen
 *
 * Detailed view of a specific booking including:
 * - Package summary
 * - Itinerary timeline
 * - Traveler details
 * - Status tracker
 * - Cancellation options
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  List,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import StepTracker from "../../src/components/StepTracker";
import { usePayment } from "../../src/hooks/usePayment";
import databaseService from "../../src/lib/databaseService";
import type { Booking, BookingStatus } from "../../src/types";

export default function BookingDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      if (!id) return;
      const data = await databaseService.bookings.getBookingById(id);
      setBooking(data);
    } catch {
      Toast.error("Failed to load booking details");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleCancelBooking = useCallback(() => {
    if (!booking) return;

    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this trip? This action cannot be undone.",
      [
        { text: "Keep Trip", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              await databaseService.bookings.cancelBooking(booking.$id);
              Toast.success("Booking cancelled");
              fetchBooking(); // Refresh details
            } catch {
              Toast.error("Failed to cancel booking");
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  }, [booking, fetchBooking]);

  const { startPayment, isProcessing: isPaymentProcessing } = usePayment();

  const handlePayNow = async () => {
    if (!booking) return;

    // Optimistic / simple payment flow trigger
    const success = await startPayment(booking.$id, booking.totalPrice);
    if (success) {
      Toast.success("Payment Successful!");
      fetchBooking(); // Refresh to update status
    }
  };

  const handleContactSupport = () => {
    const supportPhone = process.env.EXPO_PUBLIC_SUPPORT_PHONE || "";
    if (!supportPhone) {
      Toast.info("Please use the Support Tickets feature.");
      return;
    }
    Linking.openURL(`whatsapp://send?phone=${supportPhone}`).catch(() => {
      Toast.error("WhatsApp is not installed.");
    });
  };

  const statusColor = (status: BookingStatus) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      case "ready_to_fly":
        return "#00BCD4";
      default:
        return theme.colors.primary;
    }
  };

  if (isLoading || !booking) {
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const canCancel = !["completed", "cancelled", "ready_to_fly"].includes(
    booking.status
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.colors.onSurface}
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            />
            <Text variant="titleLarge" style={{ fontWeight: "bold", flex: 1 }}>
              Booking Details
            </Text>
            <Chip
              style={{ backgroundColor: statusColor(booking.status) + "20" }}
            >
              <Text
                style={{
                  color: statusColor(booking.status),
                  fontWeight: "bold",
                }}
              >
                {booking.status.replace("_", " ").toUpperCase()}
              </Text>
            </Chip>
          </View>
          <Text
            variant="bodySmall"
            style={{
              marginTop: 8,
              marginLeft: 40,
              color: theme.colors.outline,
            }}
          >
            Ref: {booking.$id}
          </Text>
        </View>

        {/* Package Summary */}
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="headlineSmall"
              style={{ fontWeight: "bold", color: theme.colors.primary }}
            >
              {booking.packageTitle}
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.secondary }}
            >
              {booking.destination}
            </Text>
            <Divider style={{ marginVertical: 12 }} />
            <View style={styles.row}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons
                  name="calendar-range"
                  size={20}
                  color={theme.colors.outline}
                />
                <View style={{ marginLeft: 8 }}>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.outline }}
                  >
                    Dates
                  </Text>
                  <Text variant="bodyMedium">
                    {format(new Date(booking.departureDate), "MMM dd")} -{" "}
                    {format(new Date(booking.returnDate), "MMM dd, yyyy")}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Status Timeline */}
        <Card style={styles.card}>
          <Card.Title title="Trip Status" />
          <Card.Content>
            <StepTracker currentStatus={booking.status} />
          </Card.Content>
        </Card>

        {/* Travelers */}
        <Card style={styles.card}>
          <Card.Title title="Travelers" />
          <Card.Content>
            {booking.travelers.map(
              (
                t: any,
                index: number // Using any for traveler json structure
              ) => (
                <List.Item
                  key={index}
                  title={t.name}
                  description={`${t.age} years • ${t.gender}`}
                  left={(props) => <List.Icon {...props} icon="account" />}
                />
              )
            )}
          </Card.Content>
        </Card>

        {/* Payment Info */}
        <Card style={styles.card}>
          <Card.Title title="Payment Details" />
          <Card.Content>
            <View style={styles.rowBetween}>
              <Text variant="bodyMedium">Total Amount</Text>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                ${booking.totalPrice}
              </Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 8 }]}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.outline }}
              >
                Payment Status
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color:
                    booking.paymentStatus === "paid" ? "#4CAF50" : "#FF9800",
                  fontWeight: "bold",
                }}
              >
                {booking.paymentStatus.toUpperCase()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          {booking.status === "pending_payment" && (
            <Button
              mode="contained"
              icon="credit-card"
              buttonColor={theme.colors.primary}
              onPress={handlePayNow}
              loading={isPaymentProcessing}
              disabled={isPaymentProcessing}
              style={styles.actionButton}
            >
              Pay Now
            </Button>
          )}

          <Button
            mode="contained"
            icon="whatsapp"
            buttonColor="#25D366"
            onPress={handleContactSupport}
            style={styles.actionButton}
          >
            Support
          </Button>

          {canCancel && (
            <Button
              mode="outlined"
              icon="cancel"
              textColor={theme.colors.error}
              style={[styles.actionButton, { borderColor: theme.colors.error }]}
              onPress={handleCancelBooking}
              loading={isCancelling}
            >
              Cancel Trip
            </Button>
          )}
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
  },
});
