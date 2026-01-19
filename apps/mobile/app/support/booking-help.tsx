/**
 * Booking Support Screen
 * Help with reservations, modifications, and cancellations
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  List,
  RadioButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import WhatsAppButton from "../../src/components/WhatsAppButton";
import databaseService from "../../src/lib/databaseService";
import { useStore } from "../../src/store/useStore";

const ISSUE_TYPES = [
  { value: "modify", label: "Modify Booking", icon: "pencil" },
  { value: "cancel", label: "Cancel Booking", icon: "close-circle-outline" },
  { value: "refund", label: "Request Refund", icon: "cash-refund" },
  { value: "reschedule", label: "Reschedule Trip", icon: "calendar-clock" },
  { value: "other", label: "Other Issue", icon: "help-circle-outline" },
];

export default function BookingSupportScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);

  const [issueType, setIssueType] = useState("modify");
  const [bookingRef, setBookingRef] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!bookingRef.trim()) {
      Toast.warn("Please enter your booking reference");
      return;
    }
    if (!details.trim()) {
      Toast.warn("Please describe your issue");
      return;
    }

    setLoading(true);
    try {
      const issueLabel = ISSUE_TYPES.find((t) => t.value === issueType)?.label;
      await databaseService.support.createTicket({
        userId: user?.$id || "guest",
        subject: `Booking Support: ${issueLabel}`,
        message: `Booking Reference: ${bookingRef}\n\nIssue Type: ${issueLabel}\n\nDetails:\n${details}`,
        category: "booking",
        priority: issueType === "cancel" ? "high" : "medium",
        status: "open",
      });
      Toast.success("Support ticket created! We'll get back to you soon.");
      router.back();
    } catch (error: any) {
      Toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["bottom"]}
    >
      <Stack.Screen
        options={{
          title: "Booking Support",
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Content>
            <View style={styles.iconRow}>
              <MaterialCommunityIcons
                name="ticket-confirmation"
                size={48}
                color={theme.colors.primary}
              />
            </View>
            <Text
              variant="titleLarge"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              How can we help with your booking?
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Select your issue type and provide details
            </Text>

            <Divider style={{ marginBottom: 16 }} />

            <Text
              variant="titleMedium"
              style={{
                fontWeight: "bold",
                marginBottom: 12,
                color: theme.colors.onSurface,
              }}
            >
              What do you need help with?
            </Text>
            <RadioButton.Group onValueChange={setIssueType} value={issueType}>
              {ISSUE_TYPES.map((type) => (
                <List.Item
                  key={type.value}
                  title={type.label}
                  left={() => (
                    <MaterialCommunityIcons
                      name={type.icon as any}
                      size={24}
                      color={
                        issueType === type.value
                          ? theme.colors.primary
                          : theme.colors.onSurfaceVariant
                      }
                    />
                  )}
                  right={() => (
                    <RadioButton
                      value={type.value}
                      color={theme.colors.primary}
                    />
                  )}
                  onPress={() => setIssueType(type.value)}
                  style={[
                    styles.listItem,
                    issueType === type.value && {
                      backgroundColor: theme.colors.primaryContainer + "30",
                    },
                  ]}
                />
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Card
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
          mode="elevated"
        >
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Booking Reference"
              placeholder="e.g., BK-123456"
              value={bookingRef}
              onChangeText={setBookingRef}
              left={<TextInput.Icon icon="identifier" />}
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Describe your issue"
              placeholder="Please provide details about your request..."
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={4}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              contentStyle={{ height: 50 }}
              icon="send"
            >
              Submit Request
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <WhatsAppButton message="Hi, I need help with my booking." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
  },
  iconRow: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  listItem: {
    borderRadius: 8,
    marginBottom: 4,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
  },
});
