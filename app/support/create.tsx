/**
 * Support Ticket Create Screen
 *
 * Form to create a new support ticket.
 */

import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  RadioButton,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { useSupport } from "../../src/hooks/useSupport";

export default function CreateTicketScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { createTicket, isLoading } = useSupport();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Toast.error("Please fill all required fields");
      return;
    }

    const success = await createTicket({
      subject,
      message,
      category: category as any,
      priority: priority as any,
    });

    if (success) {
      Toast.success("Ticket created successfully!");
      router.back();
    } else {
      Toast.error("Failed to create ticket");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "New Ticket" }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          How can we help you?
        </Text>

        <View style={styles.formGroup}>
          <Text variant="labelMedium" style={styles.label}>
            Category
          </Text>
          <SegmentedButtons
            value={category}
            onValueChange={setCategory}
            buttons={[
              { value: "general", label: "General" },
              { value: "booking", label: "Booking" },
              { value: "payment", label: "Payment" },
            ]}
            style={styles.segmentedButton}
          />
        </View>

        <TextInput
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Message"
          value={message}
          onChangeText={setMessage}
          mode="outlined"
          multiline
          numberOfLines={6}
          style={styles.input}
          placeholder="Describe your issue in detail..."
        />

        <View style={styles.formGroup}>
          <Text variant="labelMedium" style={styles.label}>
            Priority
          </Text>
          <RadioButton.Group
            onValueChange={(value) => setPriority(value)}
            value={priority}
          >
            <View style={styles.radioRow}>
              <View style={styles.radioItem}>
                <RadioButton value="low" />
                <Text>Low</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="medium" />
                <Text>Medium</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="high" />
                <Text>High</Text>
              </View>
            </View>
          </RadioButton.Group>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
          contentStyle={{ height: 48 }}
        >
          Submit Ticket
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: "#666",
  },
  input: {
    marginBottom: 16,
  },
  segmentedButton: {
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: "row",
    gap: 16,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitButton: {
    marginTop: 24,
    borderRadius: 8,
  },
});
