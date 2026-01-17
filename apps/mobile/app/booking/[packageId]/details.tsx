/**
 * Booking Step 3: Traveler Details
 *
 * Users enter details for each traveler (name, passport, etc.)
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiPressable } from "moti/interactions";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Chip,
  Dialog,
  Divider,
  HelperText,
  List,
  Portal,
  Surface,
  Switch,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import databaseService from "../../../src/lib/databaseService";
import { useStore } from "../../../src/store/useStore";
import type { SavedTraveler, Traveler } from "../../../src/types";

export default function TravelerDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { packageId } = useLocalSearchParams<{ packageId: string }>();

  const bookingDraft = useStore((state) => state.bookingDraft);
  const updateBookingDraft = useStore((state) => state.updateBookingDraft);
  const user = useStore((state) => state.user);

  // Saved Travelers State
  const [savedTravelers, setSavedTravelers] = useState<SavedTraveler[]>([]);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [activeTravelerId, setActiveTravelerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedTravelers = async () => {
      if (user?.$id) {
        try {
          const travelers = await databaseService.travelers.getUserTravelers(
            user.$id,
          );
          setSavedTravelers(travelers);
        } catch (error) {
          console.error("Failed to fetch saved travelers", error);
        }
      }
    };
    fetchSavedTravelers();
  }, [user?.$id]);

  // Create initial travelers array based on counts
  const createInitialTravelers = (): Traveler[] => {
    const travelers: Traveler[] = [];

    // Use existing travelers from draft if available
    if (bookingDraft.travelers.length > 0) {
      return bookingDraft.travelers;
    }

    // Adults
    for (let i = 0; i < bookingDraft.adultsCount; i++) {
      travelers.push({
        id: `adult_${i}`,
        name: "",
        age: 30,
        type: "adult",
        passportNumber: "",
      });
    }

    // Children
    for (let i = 0; i < bookingDraft.childrenCount; i++) {
      travelers.push({
        id: `child_${i}`,
        name: "",
        age: 8,
        type: "child",
        passportNumber: "",
      });
    }

    // Infants
    for (let i = 0; i < bookingDraft.infantsCount; i++) {
      travelers.push({
        id: `infant_${i}`,
        name: "",
        age: 1,
        type: "infant",
        passportNumber: "",
      });
    }

    return travelers;
  };

  const [travelers, setTravelers] = useState<Traveler[]>(
    createInitialTravelers,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update traveler field
  const updateTraveler = (
    id: string,
    field: keyof Traveler,
    value: string | number,
  ) => {
    setTravelers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
    // Clear error
    setErrors((prev) => ({ ...prev, [`${id}_${field}`]: "" }));
  };

  const handleOpenSavedDialog = (id: string) => {
    setActiveTravelerId(id);
    setIsDialogVisible(true);
  };

  const handleSelectSavedTraveler = (saved: SavedTraveler) => {
    if (!activeTravelerId) return;

    // Auto-fill
    updateTraveler(activeTravelerId, "name", saved.name);
    updateTraveler(activeTravelerId, "age", saved.age);
    if (saved.passportNumber) {
      updateTraveler(activeTravelerId, "passportNumber", saved.passportNumber);
    }

    // Auto-select gender implied? No field in booking form yet, but that's fine.

    setIsDialogVisible(false);
    setActiveTravelerId(null);
    Toast.success("Traveler details loaded");
  };

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (travelers) {
      travelers.forEach((traveler) => {
        if (!traveler.name.trim()) {
          newErrors[`${traveler.id}_name`] = "Name is required";
          isValid = false;
        }

        if (!traveler.passportNumber?.trim()) {
          newErrors[`${traveler.id}_passport`] = "Passport is required";
          isValid = false;
        } else if (traveler.passportNumber.length < 6) {
          newErrors[`${traveler.id}_passport`] = "Invalid passport number";
          isValid = false;
        }

        if (traveler.type === "adult" && traveler.age < 12) {
          newErrors[`${traveler.id}_age`] = "Adult must be 12+";
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  }, [travelers]);

  // Continue to next step
  const handleContinue = useCallback(() => {
    if (!validateForm()) {
      Toast.error("Please fill all required fields");
      return;
    }

    // Update draft with traveler details
    updateBookingDraft({
      travelers,
      currentStep: 3,
    });

    router.push(`/booking/${packageId}/addons` as any);
  }, [validateForm, updateBookingDraft, router, packageId, travelers]);

  // Get traveler icon
  const getTravelerIcon = (type: string) => {
    switch (type) {
      case "adult":
        return "account";
      case "child":
        return "account-child";
      case "infant":
        return "baby-face-outline";
      default:
        return "account";
    }
  };

  // Get traveler label
  const getTravelerLabel = (type: string, index: number) => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    return `${typeLabel} ${index + 1}`;
  };

  // Group travelers by type
  const adults = travelers.filter((t) => t.type === "adult");
  const children = travelers.filter((t) => t.type === "child");
  const infants = travelers.filter((t) => t.type === "infant");

  const renderTravelerForm = (traveler: Traveler, index: number) => (
    <Surface key={traveler.id} style={styles.travelerCard} elevation={1}>
      <View style={styles.travelerHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <MaterialCommunityIcons
            name={getTravelerIcon(traveler.type) as any}
            size={24}
            color={theme.colors.primary}
          />
          <Text
            variant="titleMedium"
            style={{ marginLeft: 8, fontWeight: "bold" }}
          >
            {getTravelerLabel(traveler.type, index)}
          </Text>
        </View>
        {savedTravelers.length > 0 && (
          <Chip
            icon="account-arrow-left"
            mode="outlined"
            onPress={() => handleOpenSavedDialog(traveler.id)}
            compact
          >
            Load Saved
          </Chip>
        )}
      </View>

      <TextInput
        label="Full Name (as in passport)"
        value={traveler.name}
        onChangeText={(text) => updateTraveler(traveler.id, "name", text)}
        mode="outlined"
        autoCapitalize="words"
        left={<TextInput.Icon icon="account" />}
        error={!!errors[`${traveler.id}_name`]}
        style={styles.input}
      />
      {errors[`${traveler.id}_name`] && (
        <HelperText type="error">{errors[`${traveler.id}_name`]}</HelperText>
      )}

      <TextInput
        label="Passport Number"
        value={traveler.passportNumber || ""}
        onChangeText={(text) =>
          updateTraveler(traveler.id, "passportNumber", text.toUpperCase())
        }
        mode="outlined"
        autoCapitalize="characters"
        left={<TextInput.Icon icon="passport" />}
        error={!!errors[`${traveler.id}_passport`]}
        style={styles.input}
      />
      {errors[`${traveler.id}_passport`] && (
        <HelperText type="error">
          {errors[`${traveler.id}_passport`]}
        </HelperText>
      )}

      <TextInput
        label="Age"
        value={traveler.age.toString()}
        onChangeText={(text) => {
          const age = parseInt(text) || 0;
          updateTraveler(traveler.id, "age", age);
        }}
        mode="outlined"
        keyboardType="numeric"
        left={<TextInput.Icon icon="calendar" />}
        error={!!errors[`${traveler.id}_age`]}
        style={styles.input}
      />
      {errors[`${traveler.id}_age`] && (
        <HelperText type="error">{errors[`${traveler.id}_age`]}</HelperText>
      )}
    </Surface>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
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
            Enter details exactly as they appear on passports. This information
            is required for visa processing.
          </Text>
        </View>

        {/* Adults */}
        {adults.length > 0 && (
          <>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Adults ({adults.length})
            </Text>
            {adults.map((t, i) => renderTravelerForm(t, i))}
          </>
        )}

        {/* Business Trip Section */}
        <Surface style={[styles.card, { marginTop: 16 }]} elevation={1}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: bookingDraft.isWorkTrip ? 16 : 0,
            }}
          >
            <View>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                Work Trip
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                Traveling for business?
              </Text>
            </View>
            <Switch
              value={bookingDraft.isWorkTrip}
              onValueChange={(val) => updateBookingDraft({ isWorkTrip: val })}
              color={theme.colors.primary}
            />
          </View>

          {bookingDraft.isWorkTrip && (
            <View>
              <TextInput
                label="Company Name"
                value={bookingDraft.companyName || ""}
                onChangeText={(text) =>
                  updateBookingDraft({ companyName: text })
                }
                mode="outlined"
                style={styles.input}
              />
              <TextInput
                label="Tax ID / VAT / GST"
                value={bookingDraft.taxId || ""}
                onChangeText={(text) => updateBookingDraft({ taxId: text })}
                mode="outlined"
                style={styles.input}
              />
            </View>
          )}
        </Surface>

        {/* Children */}
        {children.length > 0 && (
          <>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Children ({children.length})
            </Text>
            {children.map((t, i) => renderTravelerForm(t, i))}
          </>
        )}

        {/* Infants */}
        {infants.length > 0 && (
          <>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="titleSmall" style={styles.sectionTitle}>
              Infants ({infants.length})
            </Text>
            {infants.map((t, i) => renderTravelerForm(t, i))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <Surface style={styles.bottomBar} elevation={5}>
        <View>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            {travelers.length} Traveler{travelers.length > 1 ? "s" : ""}
          </Text>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            Details Complete
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleContinue}
          contentStyle={styles.continueButtonContent}
        >
          Review & Pay
        </Button>
      </Surface>

      {/* Saved Travelers Dialog */}
      <Portal>
        <Dialog
          visible={isDialogVisible}
          onDismiss={() => setIsDialogVisible(false)}
          style={{ maxHeight: "80%" }}
        >
          <Dialog.Title>Select Traveler</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 16,
              }}
            >
              {savedTravelers.length === 0 ? (
                <Text
                  style={{
                    textAlign: "center",
                    fontStyle: "italic",
                    marginVertical: 20,
                  }}
                >
                  No saved travelers found.
                </Text>
              ) : (
                savedTravelers.map((t) => (
                  <MotiPressable
                    key={t.$id}
                    onPress={() => handleSelectSavedTraveler(t)}
                  >
                    <List.Item
                      title={t.name}
                      description={`${t.age} years • ${t.gender}`}
                      left={(props) => <List.Icon {...props} icon="account" />}
                    />
                    <Divider />
                  </MotiPressable>
                ))
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={() => {
                setIsDialogVisible(false);
                router.push("/profile/travelers" as any);
              }}
            >
              Add New
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 12,
    color: "#666",
  },
  travelerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  travelerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 4,
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
