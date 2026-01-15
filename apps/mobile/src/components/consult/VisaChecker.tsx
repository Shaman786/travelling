import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  IconButton,
  List,
  RadioButton,
  Surface,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import databaseService from "../../lib/databaseService";
import { useStore } from "../../store/useStore";

const DESTINATIONS = [
  { label: "United States", value: "US", visa: "required" },
  { label: "United Kingdom", value: "UK", visa: "required" },
  { label: "Schengen Area", value: "EU", visa: "required" },
  { label: "Thailand", value: "TH", visa: "on_arrival" },
  { label: "Singapore", value: "SG", visa: "required" },
  { label: "Dubai (UAE)", value: "AE", visa: "required" },
  { label: "Maldives", value: "MV", visa: "visa_free" },
];

const CITIZENSHIPS = [
  { label: "India", value: "IN" },
  { label: "United States", value: "US" },
  { label: "United Kingdom", value: "UK" },
  { label: "France", value: "FR" },
];

export default function VisaChecker() {
  const router = useRouter();
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [citizenship, setCitizenship] = useState("IN");
  const [destination, setDestination] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock Result Logic
  const getResult = () => {
    if (!destination) return null;
    const dest = DESTINATIONS.find((d) => d.value === destination);
    if (!dest) return null;

    // Hardcoded logic for demo
    if (citizenship === "IN" && dest.value === "MV")
      return { status: "Visa Free", color: "#4CAF50", icon: "check-decagram" };
    if (citizenship === "IN" && dest.value === "TH")
      return {
        status: "Visa On Arrival",
        color: "#FF9800",
        icon: "airplane-check",
      };
    return {
      status: "Visa Required",
      color: "#F44336",
      icon: "file-document-alert",
    };
  };

  const result = getResult();

  const handleRequest = async () => {
    if (!destination) return;

    setLoading(true);
    try {
      const payload = {
        userId: user?.$id,
        userName: user?.name,
        userPhone: user?.phone,
        type: "visa_assistance",
        destination: DESTINATIONS.find((d) => d.value === destination)?.label,
        notes: `Citizenship: ${CITIZENSHIPS.find((c) => c.value === citizenship)?.label}`,
      };

      await databaseService.consultations.createConsultation(payload);
      Toast.success("Visa Request Sent! We'll guide you through the process.");
      router.back();
    } catch (error: any) {
      Toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
          Visa Eligibility Checker
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Step 1: Citizenship */}
        <Surface style={styles.card} elevation={1}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            1. Your Passport
          </Text>
          <RadioButton.Group onValueChange={setCitizenship} value={citizenship}>
            {CITIZENSHIPS.map((c) => (
              <RadioButton.Item
                key={c.value}
                label={c.label}
                value={c.value}
                color={theme.colors.primary}
              />
            ))}
          </RadioButton.Group>
        </Surface>

        {/* Step 2: Destination */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { marginTop: 24 }]}
        >
          2. Where are you going?
        </Text>
        <View style={styles.grid}>
          {DESTINATIONS.map((dest) => (
            <Surface
              key={dest.value}
              style={[
                styles.destCard,
                destination === dest.value && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                },
              ]}
              elevation={1}
            >
              <Button
                mode="text"
                onPress={() => setDestination(dest.value)}
                contentStyle={{ justifyContent: "flex-start" }}
                labelStyle={{ fontSize: 14 }}
              >
                {dest.label}
              </Button>
            </Surface>
          ))}
        </View>

        {/* Result Area */}
        {result && (
          <Surface
            style={[styles.resultCard, { borderColor: result.color }]}
            elevation={2}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <MaterialCommunityIcons
                name={result.icon as any}
                size={32}
                color={result.color}
              />
              <Text
                variant="headlineSmall"
                style={{
                  marginLeft: 12,
                  fontWeight: "bold",
                  color: result.color,
                }}
              >
                {result.status}
              </Text>
            </View>

            <Text variant="bodyMedium">
              Citizens of{" "}
              {CITIZENSHIPS.find((c) => c.value === citizenship)?.label}{" "}
              traveling to{" "}
              {DESTINATIONS.find((d) => d.value === destination)?.label}:
            </Text>

            <Divider style={{ marginVertical: 12 }} />

            <Text variant="titleSmall" style={{ marginBottom: 8 }}>
              Checklist:
            </Text>
            <List.Item
              title="Valid Passport (6 months validity)"
              left={(props) => (
                <List.Icon {...props} icon="check" color="green" />
              )}
            />
            {result.status === "Visa Required" && (
              <>
                <List.Item
                  title="Bank Statements (3 months)"
                  left={(props) => (
                    <List.Icon {...props} icon="check" color="green" />
                  )}
                />
                <List.Item
                  title="Confirmed Flight Tickets"
                  left={(props) => (
                    <List.Icon {...props} icon="check" color="green" />
                  )}
                />
              </>
            )}

            <Button
              mode="contained"
              onPress={handleRequest}
              loading={loading}
              disabled={loading}
              style={{ marginTop: 16 }}
            >
              Get Expert Verification
            </Button>
          </Surface>
        )}
      </ScrollView>
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
    padding: 24,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  destCard: {
    width: "48%",
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  resultCard: {
    marginTop: 32,
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
  },
});
