/**
 * Emergency Support Screen
 * 24/7 urgent assistance for travelers
 */
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Divider,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import databaseService from "../../src/lib/databaseService";
import { useStore } from "../../src/store/useStore";

const EMERGENCY_TYPES = [
  {
    value: "medical",
    label: "Medical Emergency",
    icon: "hospital-box",
    color: "#EF4444",
  },
  {
    value: "lost_passport",
    label: "Lost Passport/Documents",
    icon: "passport",
    color: "#F59E0B",
  },
  {
    value: "stranded",
    label: "Stranded/Missed Flight",
    icon: "airplane-off",
    color: "#8B5CF6",
  },
  {
    value: "safety",
    label: "Safety Concern",
    icon: "shield-alert",
    color: "#DC2626",
  },
  {
    value: "other",
    label: "Other Urgent Matter",
    icon: "alert-circle",
    color: "#6B7280",
  },
];

export default function EmergencyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);

  const [emergencyType, setEmergencyType] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmergencyCall = () => {
    // In a real app, this would be the company's 24/7 emergency line
    Linking.openURL("tel:+1234567890");
  };

  const handleSubmit = async () => {
    if (!emergencyType) {
      Toast.warn("Please select an emergency type");
      return;
    }
    if (!details.trim()) {
      Toast.warn("Please describe your situation");
      return;
    }

    setLoading(true);
    try {
      const emergencyLabel = EMERGENCY_TYPES.find(
        (t) => t.value === emergencyType,
      )?.label;
      await databaseService.support.createTicket({
        userId: user?.$id || "guest",
        subject: `🚨 EMERGENCY: ${emergencyLabel}`,
        message: `⚠️ URGENT REQUEST\n\nEmergency Type: ${emergencyLabel}\nLocation: ${location || "Not provided"}\n\nDetails:\n${details}\n\nUser: ${user?.name || "Guest"}\nPhone: ${user?.phone || "Not available"}`,
        category: "general",
        priority: "urgent",
        status: "open",
      });
      Toast.success("Emergency request sent! We're on it!");
      router.back();
    } catch (error: any) {
      Toast.error(
        error.message || "Failed to submit - please call us directly",
      );
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
          title: "Emergency Support",
          headerStyle: { backgroundColor: "#DC2626" },
          headerTintColor: "#FFFFFF",
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Emergency Call Card */}
        <Card
          style={[styles.urgentCard, { backgroundColor: "#FEE2E2" }]}
          mode="elevated"
        >
          <Card.Content>
            <View style={styles.urgentHeader}>
              <MaterialCommunityIcons
                name="phone-alert"
                size={32}
                color="#DC2626"
              />
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", color: "#DC2626", marginLeft: 12 }}
              >
                Need Immediate Help?
              </Text>
            </View>
            <Text
              variant="bodyMedium"
              style={{ color: "#7F1D1D", marginTop: 8 }}
            >
              For life-threatening emergencies, call local emergency services
              (112/911) first.
            </Text>
            <Button
              mode="contained"
              onPress={handleEmergencyCall}
              style={styles.callButton}
              buttonColor="#DC2626"
              icon="phone"
            >
              Call Our 24/7 Hotline
            </Button>
          </Card.Content>
        </Card>

        <Divider style={{ marginVertical: 16 }} />

        {/* Emergency Type Selection */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
        >
          Select Emergency Type
        </Text>

        <View style={styles.typeGrid}>
          {EMERGENCY_TYPES.map((type) => (
            <Card
              key={type.value}
              style={[
                styles.typeCard,
                {
                  backgroundColor:
                    emergencyType === type.value
                      ? type.color + "20"
                      : theme.colors.surface,
                  borderColor:
                    emergencyType === type.value ? type.color : "transparent",
                  borderWidth: emergencyType === type.value ? 2 : 0,
                },
              ]}
              onPress={() => setEmergencyType(type.value)}
            >
              <Card.Content style={styles.typeCardContent}>
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={28}
                  color={type.color}
                />
                <Text
                  variant="labelMedium"
                  style={{
                    color: theme.colors.onSurface,
                    textAlign: "center",
                    marginTop: 8,
                  }}
                >
                  {type.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Details Form */}
        {emergencyType && (
          <Card
            style={[styles.formCard, { backgroundColor: theme.colors.surface }]}
            mode="elevated"
          >
            <Card.Content>
              <TextInput
                mode="outlined"
                label="Your Current Location"
                placeholder="City, hotel, or landmark"
                value={location}
                onChangeText={setLocation}
                left={<TextInput.Icon icon="map-marker" />}
                style={styles.input}
              />

              <TextInput
                mode="outlined"
                label="Describe your situation"
                placeholder="Tell us what's happening so we can help..."
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
                buttonColor="#DC2626"
                icon="send"
              >
                Send Emergency Request
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  urgentCard: {
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#DC2626",
  },
  urgentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  callButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  typeCard: {
    width: "47%",
    borderRadius: 12,
  },
  typeCardContent: {
    alignItems: "center",
    paddingVertical: 16,
  },
  formCard: {
    borderRadius: 16,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
  },
});
