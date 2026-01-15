import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  IconButton,
  ProgressBar,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import databaseService from "../../lib/databaseService";
import { useStore } from "../../store/useStore";

// Helper to format dates
const formatDate = (d: Date | undefined) =>
  d ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";

const TOTAL_STEPS = 5;

const INTERESTS = [
  "Adventure",
  "Relaxation",
  "Culture",
  "Food",
  "Wildlife",
  "Luxury",
  "Family Fun",
  "Romantic",
  "Nightlife",
  "Shopping",
];

const BUDGET_TIERS = [
  { value: "budget", label: "Budget", icon: "wallet-outline" },
  { value: "moderate", label: "Moderate", icon: "wallet-travel" },
  { value: "luxury", label: "Luxury", icon: "diamond-stone" },
];

export default function TripWizard() {
  const router = useRouter();
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: undefined,
    endDate: undefined,
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [budgetTier, setBudgetTier] = useState("moderate");
  const [notes, setNotes] = useState("");

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async () => {
    if (!destination) {
      Toast.warn("Please enter a destination");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      // Construct the payload
      const payload = {
        userId: user?.$id,
        userName: user?.name || "Guest",
        userPhone: user?.phone || "",
        type: "plan_trip",
        destination,
        dates: dates.startDate
          ? `${formatDate(dates.startDate)} - ${formatDate(dates.endDate)}`
          : "Flexible",
        travelers: `${adults} Adults, ${children} Children`,
        budget: budgetTier,
        notes: `Interests: ${selectedInterests.join(", ")}. \nNotes: ${notes}`,
      };

      await databaseService.consultations.createConsultation(payload);

      Toast.success("Trip Request Received! ✈️");
      router.back();
    } catch (error: any) {
      console.error("Wizard submit error:", error);
      Toast.error("Failed to submit: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            Trip Planning Wizard
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Step {step} of {TOTAL_STEPS}
          </Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      <ProgressBar
        progress={step / TOTAL_STEPS}
        color={theme.colors.primary}
        style={{ height: 4 }}
      />

      {/* Content Area */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {step === 1 && (
            <View style={styles.stepContainer}>
              <MaterialCommunityIcons
                name="map-search-outline"
                size={64}
                color={theme.colors.primary}
              />
              <Text variant="headlineSmall" style={styles.stepTitle}>
                Where to?
              </Text>
              <Text variant="bodyMedium" style={styles.stepSubtitle}>
                Tell us your dream destination.
              </Text>

              <TextInput
                mode="outlined"
                label="Destination"
                placeholder="e.g. Paris, Bali, Japan"
                value={destination}
                onChangeText={setDestination}
                style={styles.textInput}
                autoFocus
              />

              <View style={styles.chipGrid}>
                {["Europe", "Maldives", "New York", "Dubai"].map((place) => (
                  <Chip
                    key={place}
                    onPress={() => setDestination(place)}
                    mode="outlined"
                    style={{ margin: 4 }}
                  >
                    {place}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <MaterialCommunityIcons
                name="calendar-month-outline"
                size={64}
                color={theme.colors.primary}
              />
              <Text variant="headlineSmall" style={styles.stepTitle}>
                When?
              </Text>
              <Text variant="bodyMedium" style={styles.stepSubtitle}>
                Select your preferred travel dates.
              </Text>

              <Button
                mode="outlined"
                onPress={() => setShowCalendar(true)}
                style={styles.actionButtonLarge}
                contentStyle={{ height: 56 }}
                icon="calendar"
              >
                {dates.startDate
                  ? `${formatDate(dates.startDate)} - ${formatDate(dates.endDate)}`
                  : "Select Dates"}
              </Button>

              <Button
                mode="text"
                onPress={() => {
                  setDates({ startDate: undefined, endDate: undefined });
                  handleNext();
                }}
              >
                I&apos;m flexible with dates
              </Button>

              <DatePickerModal
                locale="en"
                mode="range"
                visible={showCalendar}
                onDismiss={() => setShowCalendar(false)}
                startDate={dates.startDate}
                endDate={dates.endDate}
                onConfirm={({ startDate, endDate }) => {
                  setShowCalendar(false);
                  setDates({ startDate, endDate });
                }}
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={64}
                color={theme.colors.primary}
              />
              <Text variant="headlineSmall" style={styles.stepTitle}>
                Who&apos;s going?
              </Text>

              <View style={styles.counterRow}>
                <Text variant="titleMedium">Adults</Text>
                <View style={styles.counterControls}>
                  <IconButton
                    icon="minus"
                    mode="contained-tonal"
                    onPress={() => setAdults(Math.max(1, adults - 1))}
                  />
                  <Text
                    variant="titleLarge"
                    style={{ width: 40, textAlign: "center" }}
                  >
                    {adults}
                  </Text>
                  <IconButton
                    icon="plus"
                    mode="contained"
                    onPress={() => setAdults(adults + 1)}
                  />
                </View>
              </View>

              <View style={styles.counterRow}>
                <Text variant="titleMedium">Children</Text>
                <View style={styles.counterControls}>
                  <IconButton
                    icon="minus"
                    mode="contained-tonal"
                    onPress={() => setChildren(Math.max(0, children - 1))}
                  />
                  <Text
                    variant="titleLarge"
                    style={{ width: 40, textAlign: "center" }}
                  >
                    {children}
                  </Text>
                  <IconButton
                    icon="plus"
                    mode="contained"
                    onPress={() => setChildren(children + 1)}
                  />
                </View>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.stepContainer}>
              <MaterialCommunityIcons
                name="heart-multiple-outline"
                size={64}
                color={theme.colors.primary}
              />
              <Text variant="headlineSmall" style={styles.stepTitle}>
                Your Vibe
              </Text>
              <Text variant="bodyMedium" style={styles.stepSubtitle}>
                Select what interests you most.
              </Text>

              <View style={styles.chipGrid}>
                {INTERESTS.map((interest) => (
                  <Chip
                    key={interest}
                    selected={selectedInterests.includes(interest)}
                    onPress={() => toggleInterest(interest)}
                    showSelectedOverlay
                    mode="outlined"
                    style={{ margin: 4 }}
                  >
                    {interest}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {step === 5 && (
            <View style={styles.stepContainer}>
              <MaterialCommunityIcons
                name="wallet-outline"
                size={64}
                color={theme.colors.primary}
              />
              <Text variant="headlineSmall" style={styles.stepTitle}>
                The Budget
              </Text>

              <SegmentedButtons
                value={budgetTier}
                onValueChange={setBudgetTier}
                buttons={BUDGET_TIERS}
                style={{ marginBottom: 24, width: "100%" }}
              />

              <TextInput
                label="Any special requests or notes?"
                mode="outlined"
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
                style={styles.textInput}
              />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button
          mode="text"
          onPress={handleBack}
          disabled={step === 1 || loading}
          style={{ flex: 1, marginRight: 8 }}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          loading={loading}
          disabled={loading}
          style={{ flex: 2 }}
          contentStyle={{ height: 48 }}
        >
          {step === TOTAL_STEPS ? "Submit Request" : "Next"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center", // Center content vertically
  },
  stepContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  stepTitle: {
    fontWeight: "bold",
    textAlign: "center",
  },
  stepSubtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  textInput: {
    width: "100%",
    backgroundColor: "#fff",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
  },
  actionButtonLarge: {
    width: "100%",
    marginVertical: 16,
  },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  counterControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
});
