import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function FlightsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleSubmit = () => {
    Toast.success("Searching for best agent fares...");
    setTimeout(() => router.back(), 1500);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Flight Deals
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 20, color: "#666" }}>
          Exclusive consultant rates not available online.
        </Text>

        <TextInput
          label="From (City/Airport)"
          value={from}
          onChangeText={setFrom}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="To (Destination)"
          value={to}
          onChangeText={setTo}
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={{ marginTop: 10 }}
        >
          Request Quote
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
