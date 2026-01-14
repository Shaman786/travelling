import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function GroupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [size, setSize] = useState("");

  const handleSubmit = () => {
    if (!size) {
      Toast.warn("Please enter group size");
      return;
    }
    Toast.success("Group inquiry started.");
    router.push({
      pathname: "/support/create",
      params: { subject: `Group Booking Inquiry: ${size} people` },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Group Tours
        </Text>
        <Text variant="bodyMedium" style={{ marginBottom: 20, color: "#666" }}>
          Discounts for 10+ travelers. Corporate & Family.
        </Text>

        <TextInput
          label="Group Size"
          value={size}
          onChangeText={setSize}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={{ marginTop: 10 }}
        >
          Inquire Now
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
