/**
 * Booking Step 1: Select Dates
 *
 * Users select departure and return dates for their trip.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { addDays, differenceInDays, format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  IconButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import { usePackage } from "../../../src/hooks/usePackages";
import { useStore } from "../../../src/store/useStore";

export default function SelectDatesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { packageId } = useLocalSearchParams<{ packageId: string }>();

  const { package: pkg, isLoading } = usePackage(packageId);
  const bookingDraft = useStore((state) => state.bookingDraft);
  const updateBookingDraft = useStore((state) => state.updateBookingDraft);

  // Initialize with draft dates or defaults
  const [departureDate, setDepartureDate] = useState<Date>(
    bookingDraft.departureDate || addDays(new Date(), 14)
  );
  const [returnDate, setReturnDate] = useState<Date>(
    bookingDraft.returnDate || addDays(new Date(), 21)
  );

  // Modal State
  const [open, setOpen] = useState(false);

  const onDismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = useCallback(
    ({
      startDate,
      endDate,
    }: {
      startDate: Date | undefined;
      endDate: Date | undefined;
    }) => {
      setOpen(false);
      if (startDate) setDepartureDate(startDate);
      if (endDate) setReturnDate(endDate);
    },
    [setOpen, setDepartureDate, setReturnDate]
  );

  // Continue to next step
  const handleContinue = useCallback(() => {
    if (departureDate >= returnDate) {
      Toast.error("Return date must be after departure");
      return;
    }

    const tripDays = differenceInDays(returnDate, departureDate);
    if (tripDays < 1) {
      Toast.error("Minimum trip duration is 1 day");
      return;
    }

    // Update draft with selected dates
    updateBookingDraft({
      packageId,
      packageTitle: pkg?.title,
      destination: pkg?.destination,
      packagePrice: pkg?.price,
      departureDate,
      returnDate,
      currentStep: 1,
    });

    router.push(`/booking/${packageId}/travelers` as any);
  }, [departureDate, returnDate, packageId, pkg, updateBookingDraft, router]);

  const tripDuration = differenceInDays(returnDate, departureDate);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Package Summary */}
        <Surface style={styles.summaryCard} elevation={1}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            {pkg?.title || "Loading..."}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.outline, marginTop: 4 }}
          >
            {pkg?.destination}
          </Text>
        </Surface>

        {/* Date Selection */}
        <View style={styles.dateSection}>
          <Text variant="labelLarge" style={styles.dateLabel}>
            Trip Dates
          </Text>

          <Surface
            style={styles.dateCard}
            elevation={2}
            onTouchEnd={() => setOpen(true)}
          >
            <View style={styles.dateDisplay}>
              <MaterialCommunityIcons
                name="calendar-range"
                size={24}
                color={theme.colors.primary}
              />
              <View style={{ marginLeft: 16 }}>
                <Text
                  variant="labelMedium"
                  style={{ color: theme.colors.outline }}
                >
                  Departure - Return
                </Text>
                <Text
                  variant="titleLarge"
                  style={{ fontWeight: "bold", marginTop: 4 }}
                >
                  {format(departureDate, "MMM dd")} -{" "}
                  {format(returnDate, "MMM dd, yyyy")}
                </Text>
              </View>
            </View>
            <IconButton
              icon="pencil"
              mode="contained"
              size={20}
              onPress={() => setOpen(true)}
            />
          </Surface>
        </View>

        {/* Duration Indicator */}
        <View style={styles.durationIndicator}>
          <View
            style={[
              styles.durationLine,
              { backgroundColor: theme.colors.outlineVariant },
            ]}
          />
          <Surface style={styles.durationBadge} elevation={1}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              variant="labelMedium"
              style={{ marginLeft: 4, color: theme.colors.primary }}
            >
              {tripDuration} {tripDuration === 1 ? "Day" : "Days"}
            </Text>
          </Surface>
          <View
            style={[
              styles.durationLine,
              { backgroundColor: theme.colors.outlineVariant },
            ]}
          />
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            variant="bodySmall"
            style={{
              flex: 1,
              marginLeft: 8,
              color: theme.colors.onSurfaceVariant,
            }}
          >
            Tap the edit button to open the calendar and select your customized
            travel dates.
          </Text>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        locale="en"
        mode="range"
        visible={open}
        onDismiss={onDismiss}
        startDate={departureDate}
        endDate={returnDate}
        onConfirm={onConfirm}
        saveLabel="Confirm Dates" // optional
        label="Select Travel Dates" // optional
      />

      {/* Bottom CTA */}
      <Surface style={styles.bottomBar} elevation={5}>
        <View>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            Trip Duration
          </Text>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            {tripDuration} Days /{" "}
            {tripDuration - 1 > 0 ? tripDuration - 1 : tripDuration} Nights
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={isLoading}
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
  dateSection: {
    marginBottom: 8,
  },
  dateLabel: {
    marginBottom: 12,
    fontWeight: "600",
  },
  dateCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
  },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  durationLine: {
    flex: 1,
    height: 2,
  },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
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
