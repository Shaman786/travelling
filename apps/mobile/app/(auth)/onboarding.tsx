/**
 * First-Time User Onboarding Wizard
 *
 * Multi-step wizard for new users after Magic Link/OTP login.
 * Collects: Name, Phone, Travel Style, Budget, Destinations
 */

import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Chip,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CountryCodePicker,
  type Country,
} from "../../src/components/CountryCodePicker";
import { authService } from "../../src/lib/authService";
import { useStore } from "../../src/store/useStore";

// Step components data
const TRAVEL_STYLES = [
  { id: "adventure", label: "🏔️ Adventure", icon: "hiking" },
  { id: "relaxation", label: "🏖️ Relaxation", icon: "beach" },
  { id: "cultural", label: "🏛️ Cultural", icon: "city" },
  { id: "family", label: "👨‍👩‍👧‍👦 Family", icon: "account-group" },
];

const BUDGET_RANGES = [
  { id: "budget", label: "💰 Budget-Friendly", desc: "Best value trips" },
  { id: "midrange", label: "💵 Mid-Range", desc: "Balanced comfort" },
  { id: "luxury", label: "💎 Luxury", desc: "Premium experiences" },
];

const DESTINATIONS = [
  "Maldives",
  "Thailand",
  "Dubai",
  "Europe",
  "Kashmir",
  "Goa",
  "Singapore",
  "Bali",
];

export default function OnboardingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);
  const updateUser = useStore((state) => state.updateUser);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [countryCode, setCountryCode] = useState("+91"); // Default
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const [travelStyle, setTravelStyle] = useState<string>("");
  const [budgetRange, setBudgetRange] = useState<string>("");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    []
  );

  const TOTAL_STEPS = 4;

  const toggleDestination = (dest: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(dest) ? prev.filter((d) => d !== dest) : [...prev, dest]
    );
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Full phone number
      const fullPhone = `${countryCode}${phone}`;

      // Update user profile in database
      if (user?.$id) {
        await authService.updateUserProfile(user.$id, {
          name,
          phone: fullPhone,
          travelStyle,
          budgetRange,
          preferredDestinations: selectedDestinations,
          onboardingComplete: true,
        });

        // Update local store - CRITICAL: Set onboardingComplete to true immediately
        updateUser({
          name,
          phone: fullPhone,
          onboardingComplete: true,
        });
      }

      // Navigate to home
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Onboarding error:", error);
      // Fallback: update local state anyway to break loop
      updateUser({ onboardingComplete: true });
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      if (user?.$id) {
        await authService.updateUserProfile(user.$id, {
          onboardingComplete: true,
        });
      }
      // Update local store
      updateUser({ onboardingComplete: true });
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Skip onboarding error:", error);
      // Fallback: update local state anyway
      updateUser({ onboardingComplete: true });
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  const onSelectCountry = (country: Country) => {
    setCountryCode(country.dial_code);
  };

  // Step 0: Welcome
  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🌍</Text>
      <Text variant="headlineLarge" style={styles.title}>
        Welcome to Travelling!
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Let&apos;s personalize your experience in just a few steps.
      </Text>
      <View style={styles.features}>
        <Text style={styles.feature}>✈️ Discover amazing destinations</Text>
        <Text style={styles.feature}>🎯 Get personalized recommendations</Text>
        <Text style={styles.feature}>📱 Book hassle-free trips</Text>
      </View>
    </View>
  );

  // Step 1: Basic Info
  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text variant="headlineMedium" style={styles.title}>
        Tell us about yourself
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        We&apos;ll use this to personalize your experience
      </Text>

      <View style={styles.form}>
        <TextInput
          label="Your Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="account" />}
        />

        <View style={styles.phoneRow}>
          <TouchableOpacity
            style={styles.countryButton}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text variant="bodyLarge">{countryCode}</Text>
            <Text variant="bodySmall" style={{ fontSize: 10 }}>
              ▼
            </Text>
          </TouchableOpacity>

          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={[styles.input, { flex: 1 }]}
            placeholder="98765 43210"
          />
        </View>
      </View>

      <CountryCodePicker
        visible={showCountryPicker}
        onDismiss={() => setShowCountryPicker(false)}
        onSelect={onSelectCountry}
        value={countryCode}
      />
    </View>
  );

  // Step 2: Preferences
  const renderPreferences = () => (
    <ScrollView
      style={styles.scrollStep}
      contentContainerStyle={styles.stepContainer}
    >
      <Text variant="headlineMedium" style={styles.title}>
        What&apos;s your travel style?
      </Text>

      <View style={styles.optionsGrid}>
        {TRAVEL_STYLES.map((style) => (
          <Chip
            key={style.id}
            mode={travelStyle === style.id ? "flat" : "outlined"}
            selected={travelStyle === style.id}
            onPress={() => setTravelStyle(style.id)}
            style={[
              styles.styleChip,
              travelStyle === style.id && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
            textStyle={styles.chipText}
          >
            {style.label}
          </Chip>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Budget preference
      </Text>

      <View style={styles.budgetList}>
        {BUDGET_RANGES.map((budget) => (
          <Chip
            key={budget.id}
            mode={budgetRange === budget.id ? "flat" : "outlined"}
            selected={budgetRange === budget.id}
            onPress={() => setBudgetRange(budget.id)}
            style={[
              styles.budgetChip,
              budgetRange === budget.id && {
                backgroundColor: theme.colors.primaryContainer,
              },
            ]}
          >
            {budget.label}
          </Chip>
        ))}
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Dream destinations
      </Text>

      <View style={styles.destinationsGrid}>
        {DESTINATIONS.map((dest) => (
          <Chip
            key={dest}
            mode={selectedDestinations.includes(dest) ? "flat" : "outlined"}
            selected={selectedDestinations.includes(dest)}
            onPress={() => toggleDestination(dest)}
            style={[
              styles.destChip,
              selectedDestinations.includes(dest) && {
                backgroundColor: theme.colors.secondaryContainer,
              },
            ]}
          >
            {dest}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );

  // Step 3: Complete
  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.emoji}>🎉</Text>
      <Text variant="headlineLarge" style={styles.title}>
        You&apos;re all set!
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Get ready to explore amazing destinations tailored just for you.
      </Text>

      <View style={styles.summary}>
        {name && <Text style={styles.summaryItem}>👤 {name}</Text>}
        {travelStyle && (
          <Text style={styles.summaryItem}>
            🎯 {TRAVEL_STYLES.find((s) => s.id === travelStyle)?.label}
          </Text>
        )}
        {budgetRange && (
          <Text style={styles.summaryItem}>
            💰 {BUDGET_RANGES.find((b) => b.id === budgetRange)?.label}
          </Text>
        )}
        {selectedDestinations.length > 0 && (
          <Text style={styles.summaryItem}>
            ✈️ {selectedDestinations.slice(0, 3).join(", ")}
            {selectedDestinations.length > 3 &&
              ` +${selectedDestinations.length - 3} more`}
          </Text>
        )}
      </View>
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcome();
      case 1:
        return renderBasicInfo();
      case 2:
        return renderPreferences();
      case 3:
        return renderComplete();
      default:
        return null;
    }
  };

  const canProceed = () => {
    if (currentStep === 1 && !name.trim()) return false;
    return true;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header with progress */}
        <View style={styles.header}>
          {currentStep > 0 && (
            <IconButton icon="arrow-left" onPress={handleBack} />
          )}
          <View style={styles.progress}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i <= currentStep && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            ))}
          </View>
          <Button onPress={handleSkip} compact>
            Skip
          </Button>
        </View>

        {/* Step content */}
        <View style={styles.content}>{renderStep()}</View>

        {/* Footer with navigation */}
        <View style={styles.footer}>
          {currentStep < TOTAL_STEPS - 1 ? (
            <Button
              mode="contained"
              onPress={handleNext}
              disabled={!canProceed()}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Continue
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleComplete}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Start Exploring
            </Button>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  progress: {
    flexDirection: "row",
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E0E0E0",
  },
  content: {
    flex: 1,
  },
  scrollStep: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  features: {
    gap: 12,
    marginTop: 24,
  },
  feature: {
    fontSize: 16,
    opacity: 0.8,
  },
  form: {
    width: "100%",
    gap: 16,
  },
  input: {
    backgroundColor: "white",
  },
  phoneRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  countryButton: {
    height: 50, // Match typical input height
    width: 80,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#79747E", // Default Outline color
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6, // Align top with Input label offset
    backgroundColor: "white",
    flexDirection: "row",
    gap: 4,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 32,
  },
  styleChip: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  chipText: {
    fontSize: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: "600",
  },
  budgetList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    marginBottom: 32,
  },
  budgetChip: {
    paddingVertical: 8,
  },
  destinationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  destChip: {
    marginBottom: 4,
  },
  summary: {
    gap: 12,
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 16,
    width: "100%",
  },
  summaryItem: {
    fontSize: 16,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  button: {
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
