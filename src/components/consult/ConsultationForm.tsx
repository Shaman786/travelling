import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import databaseService from "../../lib/databaseService";
import { useStore } from "../../store/useStore";

interface ConsultationFormProps {
  type: string; // 'visa', 'flights', 'expert', etc.
  title: string;
  subtitle?: string;
  showDestination?: boolean;
  showDates?: boolean;
  showTravelers?: boolean;
  showBudget?: boolean;
  placeholderNotes?: string;
}

export default function ConsultationForm({
  type,
  title,
  subtitle,
  showDestination = false,
  showDates = false,
  showTravelers = false,
  showBudget = false,
  placeholderNotes = "Any specific requirements?",
}: ConsultationFormProps) {
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userName: user?.name || "",
    userPhone: user?.phone || "", // Assuming user object might have phone
    userEmail: user?.email || "",
    destination: "",
    dates: "",
    travelers: "",
    budget: "",
    notes: "",
  });

  const handleSubmit = async () => {
    if (!formData.userName || !formData.userPhone) {
      Alert.alert("Missing Info", "Name and Phone Number are required.");
      return;
    }

    setLoading(true);
    try {
      await databaseService.consultations.createConsultation({
        ...formData,
        userId: user?.$id,
        type,
      });
      Alert.alert(
        "Request Submitted",
        "We have received your request. Our expert will contact you shortly.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ marginBottom: 24 }}>
        <Text variant="headlineMedium" style={styles.title}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.form}>
        {/* Contact Info */}
        <TextInput
          label="Full Name *"
          value={formData.userName}
          onChangeText={(t) => setFormData({ ...formData, userName: t })}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Phone Number *"
          value={formData.userPhone}
          onChangeText={(t) => setFormData({ ...formData, userPhone: t })}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TextInput
          label="Email (Optional)"
          value={formData.userEmail}
          onChangeText={(t) => setFormData({ ...formData, userEmail: t })}
          mode="outlined"
          keyboardType="email-address"
          style={styles.input}
        />

        {/* Dynamic Fields */}
        {showDestination && (
          <TextInput
            label="Detination(s)"
            value={formData.destination}
            onChangeText={(t) => setFormData({ ...formData, destination: t })}
            mode="outlined"
            style={styles.input}
          />
        )}

        {showDates && (
          <TextInput
            label="Preferred Dates"
            value={formData.dates}
            onChangeText={(t) => setFormData({ ...formData, dates: t })}
            mode="outlined"
            placeholder="e.g. Next month, Dec 25-30"
            style={styles.input}
          />
        )}

        <View style={styles.row}>
          {showTravelers && (
            <TextInput
              label="Travelers"
              value={formData.travelers}
              onChangeText={(t) => setFormData({ ...formData, travelers: t })}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, { flex: 1, marginRight: 8 }]}
            />
          )}
          {showBudget && (
            <TextInput
              label="Budget (Approx)"
              value={formData.budget}
              onChangeText={(t) => setFormData({ ...formData, budget: t })}
              mode="outlined"
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
            />
          )}
        </View>

        <TextInput
          label="Additional Notes"
          value={formData.notes}
          onChangeText={(t) => setFormData({ ...formData, notes: t })}
          mode="outlined"
          multiline
          numberOfLines={4}
          placeholder={placeholderNotes}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
          contentStyle={{ height: 48 }}
        >
          Submit Request
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    marginTop: 12,
    borderRadius: 8,
  },
});
