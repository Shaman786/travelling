/**
 * Booking Step 2: Add Travelers
 *
 * Users specify number and type of travelers.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { differenceInDays, format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import { usePackage } from "../../../src/hooks/usePackages";
import { useStore } from "../../../src/store/useStore";

export default function TravelersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { packageId } = useLocalSearchParams<{ packageId: string }>();

  const { package: pkg } = usePackage(packageId);
  const bookingDraft = useStore((state) => state.bookingDraft);
  const updateBookingDraft = useStore((state) => state.updateBookingDraft);

  // Traveler counts
  const [adults, setAdults] = useState(bookingDraft.adultsCount || 1);
  const [children, setChildren] = useState(bookingDraft.childrenCount || 0);
  const [infants, setInfants] = useState(bookingDraft.infantsCount || 0);

  // Adjust traveler count
  const adjustCount = (
    type: "adults" | "children" | "infants",
    delta: number
  ) => {
    if (type === "adults") {
      const newCount = Math.max(1, adults + delta); // Minimum 1 adult
      setAdults(newCount);
    } else if (type === "children") {
      const newCount = Math.max(0, children + delta);
      setChildren(newCount);
    } else {
      const newCount = Math.max(0, infants + delta);
      setInfants(newCount);
    }
  };

  // Calculate total
  const totalTravelers = adults + children + infants;
  const basePrice = pkg?.price || 0;
  const childDiscount = 0.5; // 50% off for children
  const infantPrice = 0; // Free for infants

  const totalPrice =
    adults * basePrice +
    children * basePrice * childDiscount +
    infants * infantPrice;

  // Continue to next step
  const handleContinue = useCallback(() => {
    if (totalTravelers < 1) {
      Toast.error("Add at least 1 traveler");
      return;
    }

    if (totalTravelers > 10) {
      Toast.error(
        "Maximum 10 travelers allowed. Contact us for group bookings."
      );
      return;
    }

    // Each infant must have an adult
    if (infants > adults) {
      Toast.error("Each infant requires an adult");
      return;
    }

    // Update draft
    updateBookingDraft({
      adultsCount: adults,
      childrenCount: children,
      infantsCount: infants,
      currentStep: 2,
    });

    router.push(`/booking/${packageId}/details` as any);
  }, [
    adults,
    children,
    infants,
    totalTravelers,
    packageId,
    updateBookingDraft,
    router,
  ]);

  // Trip summary
  const tripDuration =
    bookingDraft.departureDate && bookingDraft.returnDate
      ? differenceInDays(bookingDraft.returnDate, bookingDraft.departureDate)
      : 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Trip Summary */}
        <Surface style={styles.summaryCard} elevation={1}>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color={theme.colors.primary}
            />
            <Text
              variant="titleMedium"
              style={{ marginLeft: 8, fontWeight: "bold" }}
            >
              {bookingDraft.destination || pkg?.destination}
            </Text>
          </View>
          {bookingDraft.departureDate && (
            <View style={[styles.summaryRow, { marginTop: 8 }]}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={theme.colors.outline}
              />
              <Text
                variant="bodyMedium"
                style={{ marginLeft: 8, color: theme.colors.outline }}
              >
                {format(bookingDraft.departureDate, "MMM dd")} -{" "}
                {format(bookingDraft.returnDate!, "MMM dd, yyyy")} (
                {tripDuration} days)
              </Text>
            </View>
          )}
        </Surface>

        {/* Adults */}
        <Surface style={styles.travelerCard} elevation={1}>
          <View style={styles.travelerInfo}>
            <MaterialCommunityIcons
              name="account"
              size={28}
              color={theme.colors.primary}
            />
            <View style={styles.travelerText}>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                Adults
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Age 12+
              </Text>
            </View>
          </View>
          <View style={styles.travelerControls}>
            <IconButton
              icon="minus"
              mode="outlined"
              size={20}
              onPress={() => adjustCount("adults", -1)}
              disabled={adults <= 1}
            />
            <Text variant="headlineSmall" style={styles.countText}>
              {adults}
            </Text>
            <IconButton
              icon="plus"
              mode="outlined"
              size={20}
              onPress={() => adjustCount("adults", 1)}
            />
          </View>
        </Surface>

        {/* Children */}
        <Surface style={styles.travelerCard} elevation={1}>
          <View style={styles.travelerInfo}>
            <MaterialCommunityIcons
              name="account-child"
              size={28}
              color={theme.colors.secondary}
            />
            <View style={styles.travelerText}>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                Children
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Age 2-11 (50% off)
              </Text>
            </View>
          </View>
          <View style={styles.travelerControls}>
            <IconButton
              icon="minus"
              mode="outlined"
              size={20}
              onPress={() => adjustCount("children", -1)}
              disabled={children <= 0}
            />
            <Text variant="headlineSmall" style={styles.countText}>
              {children}
            </Text>
            <IconButton
              icon="plus"
              mode="outlined"
              size={20}
              onPress={() => adjustCount("children", 1)}
            />
          </View>
        </Surface>

        {/* Infants */}
        <Surface style={styles.travelerCard} elevation={1}>
          <View style={styles.travelerInfo}>
            <MaterialCommunityIcons
              name="baby-face-outline"
              size={28}
              color={theme.colors.tertiary}
            />
            <View style={styles.travelerText}>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                Infants
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Under 2 (Free)
              </Text>
            </View>
          </View>
          <View style={styles.travelerControls}>
            <IconButton
              icon="minus"
              mode="outlined"
              size={20}
              onPress={() => adjustCount("infants", -1)}
              disabled={infants <= 0}
            />
            <Text variant="headlineSmall" style={styles.countText}>
              {infants}
            </Text>
            <IconButton
              icon="plus"
              mode="outlined"
              size={20}
              onPress={() => adjustCount("infants", 1)}
            />
          </View>
        </Surface>

        {/* Price Breakdown */}
        <Surface style={styles.priceCard} elevation={1}>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", marginBottom: 12 }}
          >
            Price Breakdown
          </Text>

          <View style={styles.priceRow}>
            <Text variant="bodyMedium">
              {adults} Adult{adults > 1 ? "s" : ""} × ${basePrice}
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
              ${adults * basePrice}
            </Text>
          </View>

          {children > 0 && (
            <View style={styles.priceRow}>
              <Text variant="bodyMedium">
                {children} Child{children > 1 ? "ren" : ""} × $
                {basePrice * childDiscount}
              </Text>
              <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                ${children * basePrice * childDiscount}
              </Text>
            </View>
          )}

          {infants > 0 && (
            <View style={styles.priceRow}>
              <Text variant="bodyMedium">
                {infants} Infant{infants > 1 ? "s" : ""}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.tertiary, fontWeight: "600" }}
              >
                FREE
              </Text>
            </View>
          )}

          <Divider style={{ marginVertical: 12 }} />

          <View style={styles.priceRow}>
            <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
              Total
            </Text>
            <Text
              variant="headlineSmall"
              style={{ fontWeight: "bold", color: theme.colors.primary }}
            >
              ${totalPrice.toLocaleString()}
            </Text>
          </View>
        </Surface>
      </ScrollView>

      {/* Bottom CTA */}
      <Surface style={styles.bottomBar} elevation={5}>
        <View>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            {totalTravelers} Traveler{totalTravelers > 1 ? "s" : ""}
          </Text>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", color: theme.colors.primary }}
          >
            ${totalPrice.toLocaleString()}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleContinue}
          contentStyle={styles.continueButtonContent}
        >
          Continue
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
    paddingBottom: 100,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  travelerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  travelerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  travelerText: {
    marginLeft: 12,
  },
  travelerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  countText: {
    minWidth: 40,
    textAlign: "center",
    fontWeight: "bold",
  },
  priceCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  continueButtonContent: {
    height: 48,
    paddingHorizontal: 24,
  },
});
