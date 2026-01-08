/**
 * Booking Step 4: Review & Pay
 *
 * Final review of booking details and payment initiation.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { differenceInDays, format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Button,
  Checkbox,
  Divider,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import { usePackage } from "../../../src/hooks/usePackages";
import { bookingService } from "../../../src/lib/databaseService";
import { useStore } from "../../../src/store/useStore";
import type { Booking } from "../../../src/types";

export default function ReviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { packageId } = useLocalSearchParams<{ packageId: string }>();

  const { package: pkg } = usePackage(packageId);
  const user = useStore((state) => state.user);
  const bookingDraft = useStore((state) => state.bookingDraft);
  const addBookedTrip = useStore((state) => state.addBookedTrip);
  const resetBookingDraft = useStore((state) => state.resetBookingDraft);

  const [specialRequests, setSpecialRequests] = useState(
    bookingDraft.specialRequests || ""
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const basePrice = pkg?.price || 0;
  const tripDuration =
    bookingDraft.departureDate && bookingDraft.returnDate
      ? differenceInDays(bookingDraft.returnDate, bookingDraft.departureDate)
      : 0;

  const adultTotal = bookingDraft.adultsCount * basePrice;
  const childTotal = bookingDraft.childrenCount * (basePrice * 0.5);
  const infantTotal = 0;
  const subtotal = adultTotal + childTotal + infantTotal;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const totalPrice = subtotal + serviceFee;

  // Submit booking
  const handleSubmitBooking = useCallback(async () => {
    if (!acceptedTerms) {
      Toast.error("Please accept the terms and conditions");
      return;
    }

    if (!user?.$id) {
      Toast.error("Please login to continue");
      router.push("/(auth)/login" as any);
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData: Omit<
        Booking,
        | "$id"
        | "createdAt"
        | "updatedAt"
        | "$createdAt"
        | "$updatedAt"
        | "$collectionId"
        | "$databaseId"
        | "$permissions"
        | "$sequence"
      > = {
        userId: user.$id,
        packageId: packageId,
        packageTitle: bookingDraft.packageTitle || pkg?.title || "",
        destination: bookingDraft.destination || pkg?.destination || "",
        departureDate: bookingDraft.departureDate?.toISOString() || "",
        returnDate: bookingDraft.returnDate?.toISOString() || "",
        travelers: bookingDraft.travelers,
        adultsCount: bookingDraft.adultsCount,
        childrenCount: bookingDraft.childrenCount,
        infantsCount: bookingDraft.infantsCount,
        totalPrice: totalPrice,
        status: "pending_payment",
        statusHistory: [
          {
            status: "pending_payment",
            date: new Date().toISOString(),
            note: "Booking created",
          },
        ],
        paymentStatus: "pending",
        specialRequests: specialRequests || undefined,
      };

      // Create in Appwrite
      const booking = await bookingService.createBooking(bookingData);
      addBookedTrip(booking);

      // ================================================================
      // PAYMENT GATEWAY INTEGRATION PLACEHOLDER
      // ================================================================
      //
      // To integrate a payment gateway (Razorpay, Stripe, etc.):
      // 1. Install the gateway SDK
      // 2. Create an order with the gateway
      // 3. Open the payment sheet/checkout
      // 4. On success callback, update payment record
      //
      // Example flow:
      // const payment = await paymentService.createPayment({
      //   bookingId: booking.$id,
      //   userId: user.$id,
      //   amount: totalPrice,
      //   currency: "INR",
      //   gatewayProvider: "razorpay",
      // });
      //
      // const options = {
      //   key: RAZORPAY_KEY,
      //   amount: totalPrice * 100,
      //   order_id: gatewayOrderId,
      //   handler: async (response) => {
      //     await paymentService.updatePaymentFromGateway(payment.$id, {
      //       gatewayPaymentId: response.razorpay_payment_id,
      //       gatewaySignature: response.razorpay_signature,
      //       status: "completed",
      //     });
      //   }
      // };
      // RazorpayCheckout.open(options);
      // ================================================================

      // TEMPORARY: Simulate payment success until gateway is configured
      // This marks the booking as paid immediately (remove when gateway is integrated)
      await bookingService.updatePaymentStatus(
        booking.$id,
        "paid",
        `SIMULATED_${Date.now()}`
      );
      await bookingService.updateBookingStatus(
        booking.$id,
        "processing",
        "Payment simulated - Replace with actual gateway"
      );

      // Clear draft and navigate
      resetBookingDraft();
      Toast.success("Booking confirmed! 🎉");

      // Navigate to My Trips
      router.replace("/(tabs)/mytrips" as any);
    } catch (error: any) {
      Toast.error(error.message || "Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    acceptedTerms,
    user,
    packageId,
    bookingDraft,
    pkg,
    specialRequests,
    totalPrice,
    addBookedTrip,
    resetBookingDraft,
    router,
  ]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Package Summary */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="labelLarge" style={styles.cardTitle}>
            Package
          </Text>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            {bookingDraft.packageTitle || pkg?.title}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            {bookingDraft.destination || pkg?.destination}
          </Text>
        </Surface>

        {/* Trip Dates */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="labelLarge" style={styles.cardTitle}>
            Trip Dates
          </Text>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <MaterialCommunityIcons
                name="airplane-takeoff"
                size={20}
                color={theme.colors.primary}
              />
              <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                {bookingDraft.departureDate
                  ? format(bookingDraft.departureDate, "EEE, MMM dd, yyyy")
                  : "Not set"}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <MaterialCommunityIcons
                name="airplane-landing"
                size={20}
                color={theme.colors.secondary}
              />
              <Text variant="bodyMedium" style={{ marginLeft: 8 }}>
                {bookingDraft.returnDate
                  ? format(bookingDraft.returnDate, "EEE, MMM dd, yyyy")
                  : "Not set"}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.durationBadge,
              { backgroundColor: theme.colors.primaryContainer },
            ]}
          >
            <Text style={{ color: theme.colors.onPrimaryContainer }}>
              {tripDuration} Days /{" "}
              {tripDuration - 1 > 0 ? tripDuration - 1 : tripDuration} Nights
            </Text>
          </View>
        </Surface>

        {/* Travelers */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="labelLarge" style={styles.cardTitle}>
            Travelers ({bookingDraft.travelers.length})
          </Text>
          {bookingDraft.travelers.map(
            (
              traveler: { id: string; name: string; age: number; type: string },
              index: number
            ) => (
              <View key={traveler.id} style={styles.travelerRow}>
                <MaterialCommunityIcons
                  name={
                    traveler.type === "adult"
                      ? "account"
                      : traveler.type === "child"
                        ? "account-child"
                        : "baby-face-outline"
                  }
                  size={20}
                  color={theme.colors.outline}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                    {traveler.name || `Traveler ${index + 1}`}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.outline }}
                  >
                    {traveler.type.charAt(0).toUpperCase() +
                      traveler.type.slice(1)}
                    , Age {traveler.age}
                  </Text>
                </View>
              </View>
            )
          )}
        </Surface>

        {/* Special Requests */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="labelLarge" style={styles.cardTitle}>
            Special Requests
          </Text>
          <TextInput
            placeholder="Any dietary requirements, room preferences, etc."
            value={specialRequests}
            onChangeText={setSpecialRequests}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={{ marginTop: 8 }}
          />
        </Surface>

        {/* Price Breakdown */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="labelLarge" style={styles.cardTitle}>
            Price Breakdown
          </Text>

          <View style={styles.priceRow}>
            <Text variant="bodyMedium">
              {bookingDraft.adultsCount} Adults × ${basePrice}
            </Text>
            <Text variant="bodyMedium">${adultTotal.toFixed(2)}</Text>
          </View>

          {bookingDraft.childrenCount > 0 && (
            <View style={styles.priceRow}>
              <Text variant="bodyMedium">
                {bookingDraft.childrenCount} Children × $
                {(basePrice * 0.5).toFixed(2)}
              </Text>
              <Text variant="bodyMedium">${childTotal.toFixed(2)}</Text>
            </View>
          )}

          {bookingDraft.infantsCount > 0 && (
            <View style={styles.priceRow}>
              <Text variant="bodyMedium">
                {bookingDraft.infantsCount} Infants
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.tertiary }}
              >
                FREE
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text variant="bodyMedium">Service Fee (5%)</Text>
            <Text variant="bodyMedium">${serviceFee.toFixed(2)}</Text>
          </View>

          <Divider style={{ marginVertical: 12 }} />

          <View style={styles.priceRow}>
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              Total
            </Text>
            <Text
              variant="headlineSmall"
              style={{ fontWeight: "bold", color: theme.colors.primary }}
            >
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
        </Surface>

        {/* Terms */}
        <View style={styles.termsRow}>
          <Checkbox
            status={acceptedTerms ? "checked" : "unchecked"}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            color={theme.colors.primary}
          />
          <Text variant="bodySmall" style={{ flex: 1 }}>
            I agree to the{" "}
            <TouchableOpacity
              onPress={() => router.push("/(legal)/terms" as any)}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  textDecorationLine: "underline",
                }}
              >
                Terms and Conditions
              </Text>
            </TouchableOpacity>{" "}
            and{" "}
            <TouchableOpacity
              onPress={() => router.push("/(legal)/cancellation-policy" as any)}
            >
              <Text
                style={{
                  color: theme.colors.primary,
                  textDecorationLine: "underline",
                }}
              >
                Cancellation Policy
              </Text>
            </TouchableOpacity>
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <Surface style={styles.bottomBar} elevation={5}>
        <View>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            Total
          </Text>
          <Text
            variant="headlineSmall"
            style={{ fontWeight: "bold", color: theme.colors.primary }}
          >
            ${totalPrice.toFixed(2)}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleSubmitBooking}
          disabled={isSubmitting || !acceptedTerms}
          loading={isSubmitting}
          contentStyle={styles.payButtonContent}
          style={styles.payButton}
        >
          {isSubmitting ? "Processing..." : "Pay Now"}
        </Button>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  dateRow: {
    gap: 8,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  durationBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  travelerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  payButton: {
    borderRadius: 12,
  },
  payButtonContent: {
    height: 52,
    paddingHorizontal: 32,
  },
});
