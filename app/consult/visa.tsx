import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function VisaScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [citizenship, setCitizenship] = useState("");

  const handleSubmit = () => {
    Toast.success("Visa requirements checks initiated.");
    setTimeout(() => router.back(), 1500);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Visa Assistance
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 20, color: "#666" }}>
          Let us handle the paperwork. 99% approval rate.
        </Text>

        <TextInput
          label="Destination Country"
          value={country}
          onChangeText={setCountry}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Citizenship (Passport)"
          value={citizenship}
          onChangeText={setCitizenship}
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={{ marginTop: 10 }}
        >
          Check Requirements
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontWeight: "bold", marginBottom: 8 },
  input: { marginBottom: 16, backgroundColor: "#fff" },
});
