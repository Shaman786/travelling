/**
 * Support Ticket Details Screen
 *
 * Displays ticket conversation and allows sending replies.
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

import { supportService } from "../../src/lib/databaseService";
import { useStore } from "../../src/store/useStore";
import type { SupportTicket, TicketMessage } from "../../src/types";

// Status Colors
const STATUS_COLORS = {
  open: "#2196F3",
  in_progress: "#FF9800",
  resolved: "#4CAF50",
  closed: "#9E9E9E",
};

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const router = useRouter();
  const user = useStore((state) => state.user);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [replyText, setReplyText] = useState("");

  const flatListRef = useRef<FlatList>(null);

  const fetchData = useCallback(async () => {
    if (!id || typeof id !== "string") return;

    try {
      const [ticketData, messagesData] = await Promise.all([
        supportService.getTicketById(id),
        supportService.getTicketMessages(id),
      ]);

      setTicket(ticketData);
      setMessages(messagesData);
    } catch (error) {
      console.error("Fetch ticket error:", error);
      Toast.error("Failed to load ticket details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !user?.$id || !id || typeof id !== "string")
      return;

    setIsSending(true);
    try {
      const newMessage = await supportService.sendTicketMessage({
        ticketId: id,
        senderId: user.$id,
        senderName: user.name,
        message: replyText.trim(),
        isAdmin: false,
      } as any);

      setMessages((prev) => [...prev, newMessage]);
      setReplyText("");
      Toast.success("Reply sent successfully");

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Send reply error:", error);
      Toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;

    try {
      await supportService.updateTicketStatus(ticket.$id, "closed");
      setTicket((prev) => (prev ? { ...prev, status: "closed" } : null));
      Toast.success("Ticket closed");
    } catch {
      Toast.error("Failed to close ticket");
    }
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text variant="titleMedium">Ticket not found</Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[ticket.status] || theme.colors.primary;

  const renderMessage = ({ item }: { item: TicketMessage }) => {
    const isMe = item.senderId === user?.$id;
    const isAdmin = item.isAdmin;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRight : styles.messageLeft,
        ]}
      >
        {!isMe && (
          <View
            style={[
              styles.avatar,
              { backgroundColor: isAdmin ? theme.colors.primary : "#ccc" },
            ]}
          >
            <MaterialCommunityIcons
              name={isAdmin ? "shield-account" : "account"}
              size={16}
              color="#fff"
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isMe
              ? { backgroundColor: theme.colors.primaryContainer }
              : { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          {!isMe && (
            <Text
              variant="labelSmall"
              style={{ marginBottom: 4, color: theme.colors.primary }}
            >
              {item.senderName} {isAdmin && "(Support)"}
            </Text>
          )}
          <Text variant="bodyMedium">{item.message}</Text>
          <Text
            variant="labelSmall"
            style={{
              marginTop: 4,
              fontSize: 10,
              color: theme.colors.outline,
              alignSelf: "flex-end",
            }}
          >
            {format(new Date(item.createdAt), "MMM dd, HH:mm")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{ title: `Ticket #${ticket.$id.substring(0, 8)}` }}
      />

      <Surface style={styles.header} elevation={1}>
        <View style={styles.headerTop}>
          <Text variant="titleMedium" style={styles.subject}>
            {ticket.subject}
          </Text>
          <Chip
            style={{ backgroundColor: statusColor + "20" }}
            textStyle={{ color: statusColor, fontSize: 11, fontWeight: "bold" }}
          >
            {ticket.status.toUpperCase().replace("_", " ")}
          </Chip>
        </View>
        <View style={styles.headerBottom}>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {ticket.category} •{" "}
            {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
          </Text>
          {ticket.status !== "closed" && (
            <Button
              mode="text"
              compact
              textColor={theme.colors.error}
              onPress={handleCloseTicket}
            >
              Close Ticket
            </Button>
          )}
        </View>
      </Surface>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.initialMessage}>
            <Text
              variant="bodySmall"
              style={{ textAlign: "center", color: theme.colors.outline }}
            >
              Ticket created with message:
            </Text>
            <Card style={styles.initialCard}>
              <Card.Content>
                <Text variant="bodyMedium">{ticket.message}</Text>
              </Card.Content>
            </Card>
            <Divider style={{ marginVertical: 16 }} />
          </View>
        )}
      />

      {ticket.status !== "closed" ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <Surface style={styles.inputContainer} elevation={4}>
            <TextInput
              mode="outlined"
              placeholder="Type your reply..."
              value={replyText}
              onChangeText={setReplyText}
              style={styles.input}
              multiline
              dense
            />
            <IconButton
              icon="send"
              mode="contained"
              containerColor={theme.colors.primary}
              iconColor="#fff"
              size={24}
              onPress={handleSendReply}
              loading={isSending}
              disabled={isSending || !replyText.trim()}
            />
          </Surface>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.closedContainer}>
          <MaterialCommunityIcons
            name="lock"
            size={20}
            color={theme.colors.outline}
          />
          <Text
            variant="bodyMedium"
            style={{ marginLeft: 8, color: theme.colors.outline }}
          >
            This ticket is closed.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  headerBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subject: {
    flex: 1,
    fontWeight: "bold",
    marginRight: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  initialMessage: {
    marginBottom: 8,
  },
  initialCard: {
    marginTop: 8,
    backgroundColor: "#f9f9f9",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 16,
    maxWidth: "80%",
  },
  messageLeft: {
    alignSelf: "flex-start",
  },
  messageRight: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginLeft: 0,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "100%",
  },
  inputContainer: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginRight: 8,
    maxHeight: 100,
  },
  closedContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
});
