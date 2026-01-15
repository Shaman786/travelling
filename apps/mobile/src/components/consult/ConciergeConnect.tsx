import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Button,
  Card,
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import databaseService from "../../lib/databaseService";
import { useStore } from "../../store/useStore";

const TOPICS = [
  { id: "custom", label: "Custom Itinerary", icon: "map-check" },
  { id: "flights", label: "Flight Deals", icon: "airplane" },
  { id: "visa", label: "Visa Help", icon: "passport" },
  { id: "hotels", label: "Hotel Booking", icon: "bed" },
  { id: "safety", label: "Safety Advice", icon: "shield-check" },
  { id: "other", label: "Other", icon: "dots-horizontal" },
];

export default function ConciergeConnect() {
  const router = useRouter();
  const theme = useTheme();
  const user = useStore((state) => state.user);

  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<"chat" | "call" | "callback" | null>(
    null
  );
  const [notes, setNotes] = useState("");

  const handleConnect = async (
    selectedMethod: "chat" | "call" | "callback"
  ) => {
    if (!selectedTopic) {
      Toast.warn("Please select a topic first.");
      return;
    }

    setMethod(selectedMethod);
    setLoading(true);

    try {
      // Construct payload
      const payload = {
        userId: user?.$id,
        userName: user?.name || "Guest",
        userPhone: user?.phone || "",
        type: "expert_consultation",
        notes: `Topic: ${TOPICS.find((t) => t.id === selectedTopic)?.label}. \nMethod: ${selectedMethod}. \nNotes: ${notes}`,
        // In a real app, 'destination' might be inferred or asked, but for Expert chat it's open-ended
        destination: "Expert Consultation",
      };

      if (selectedMethod === "call") {
        Linking.openURL("tel:+1234567890"); // Placeholder number
        setLoading(false);
        return;
      }

      // For Chat/Callback, we create a record
      await databaseService.consultations.createConsultation(payload);

      Toast.success(
        selectedMethod === "chat" ? "Starting chat..." : "Callback requested!"
      );

      if (selectedMethod === "chat") {
        // Navigate to a chat screen or support screen
        // router.push("/support/chat");
        Alert.alert("Chat Initiated", "An agent will join shortly.");
        router.back();
      } else {
        router.back();
      }
    } catch (error: any) {
      console.error("Expert connect error:", error);
      Toast.error("Failed to connect: " + error.message);
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
          Talk to Expert
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Expert Profile Card */}
        <Surface style={styles.expertCard} elevation={2}>
          <View style={styles.expertHeader}>
            <View>
              <Avatar.Image
                size={64}
                source={{ uri: "https://i.pravatar.cc/150?u=travel_expert" }}
              />
              <View style={styles.onlineBadge} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                Sarah Jenkins
              </Text>
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Senior Travel Consultant
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text variant="labelSmall" style={{ marginLeft: 4 }}>
                  4.9 (500+ Trips planned)
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.expertQuote}>
            <Text
              variant="bodyMedium"
              style={{
                fontStyle: "italic",
                color: theme.colors.onSurfaceVariant,
              }}
            >
              &quot;Hi! I specialize in luxury getaways and complex itineraries.
              How can I help you today?&quot;
            </Text>
          </View>
        </Surface>

        {/* Topic Selection */}
        <Text
          variant="titleMedium"
          style={[styles.sectionTitle, { color: theme.colors.primary }]}
        >
          What do you need help with?
        </Text>

        <View style={styles.grid}>
          {TOPICS.map((topic) => (
            <Card
              key={topic.id}
              style={[
                styles.topicCard,
                selectedTopic === topic.id && {
                  borderColor: theme.colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedTopic(topic.id)}
              mode="outlined"
            >
              <Card.Content
                style={{ alignItems: "center", paddingVertical: 12 }}
              >
                <MaterialCommunityIcons
                  name={topic.icon as any}
                  size={32}
                  color={
                    selectedTopic === topic.id
                      ? theme.colors.primary
                      : theme.colors.outline
                  }
                />
                <Text
                  variant="labelMedium"
                  style={{
                    marginTop: 8,
                    textAlign: "center",
                    color:
                      selectedTopic === topic.id
                        ? theme.colors.primary
                        : theme.colors.onSurface,
                  }}
                >
                  {topic.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {selectedTopic && (
          <TextInput
            label="Briefly describe your question (Optional)"
            mode="outlined"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
            style={{ marginTop: 16, backgroundColor: "#fff" }}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={() => handleConnect("chat")}
            icon="chat-processing"
            contentStyle={{ height: 56 }}
            style={[
              styles.actionBtn,
              { backgroundColor: theme.colors.primary },
            ]}
            loading={loading && method === "chat"}
            disabled={loading}
          >
            Chat Now
          </Button>

          <View style={styles.secondaryActions}>
            <Button
              mode="outlined"
              onPress={() => handleConnect("call")}
              icon="phone"
              style={styles.halfBtn}
              disabled={loading}
            >
              Call
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleConnect("callback")}
              icon="phone-return"
              style={styles.halfBtn}
              disabled={loading}
            >
              Request Callback
            </Button>
          </View>
        </View>
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
  expertCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 24,
  },
  expertHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
  },
  expertQuote: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
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
  topicCard: {
    width: "30%", // roughly 3 per row with gap
    flexGrow: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  actionsContainer: {
    marginTop: 32,
    gap: 12,
  },
  actionBtn: {
    borderRadius: 12,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 12,
  },
  halfBtn: {
    flex: 1,
    borderRadius: 12,
  },
});
