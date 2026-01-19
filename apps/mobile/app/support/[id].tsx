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
  Chip,
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

    // Poll for new messages every 5 seconds
    const interval = setInterval(async () => {
      if (!id || typeof id !== "string") return;
      try {
        const messagesData = await supportService.getTicketMessages(id);
        // Only update if count differs or last message ID differs (simple check)
        // For robustness, we just set it, React diffing handles the rest
        setMessages(messagesData);

        // Also refresh ticket status if needed
        const ticketData = await supportService.getTicketById(id);
        if (ticketData) setTicket(ticketData);
      } catch {
        // Silent fail on poll
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchData, id]);

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

  /*
   * UI: Modern Chat Interface
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return theme.colors.primary;
      case "in_progress":
        return theme.colors.secondary;
      case "resolved":
        return theme.colors.tertiary;
      case "closed":
        return theme.colors.outline;
      default:
        return theme.colors.primary;
    }
  };

  const statusColor = getStatusColor(ticket.status);
  const renderMessage = ({ item }: { item: TicketMessage }) => {
    const isMe = item.senderId === user?.$id;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        {!isMe && (
          <Surface
            style={[
              styles.avatarContainer,
              { backgroundColor: theme.colors.primary },
            ]}
            elevation={1}
          >
            <MaterialCommunityIcons name="face-agent" size={20} color="#fff" />
          </Surface>
        )}

        <View
          style={[
            styles.bubble,
            isMe
              ? [styles.bubbleRight, { backgroundColor: theme.colors.primary }]
              : [
                  styles.bubbleLeft,
                  { backgroundColor: theme.colors.surfaceVariant },
                ],
          ]}
        >
          {!isMe && (
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.primary,
                marginBottom: 2,
                fontWeight: "bold",
              }}
            >
              {item.senderName || "Support"}
            </Text>
          )}
          <Text
            variant="bodyMedium"
            style={{ color: isMe ? "#fff" : theme.colors.onSurfaceVariant }}
          >
            {item.message}
          </Text>
          <Text
            variant="labelSmall"
            style={{
              marginTop: 4,
              fontSize: 10,
              color: isMe ? "rgba(255,255,255,0.7)" : theme.colors.outline,
              alignSelf: "flex-end",
            }}
          >
            {format(new Date(item.createdAt), "HH:mm")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top", "left", "right"]} // Don't handle bottom here, KeyboardAvoidingView does it
    >
      <Stack.Screen
        options={{
          title: "Support Chat",
          headerStyle: { backgroundColor: theme.colors.surface },
          headerShadowVisible: false,
        }}
      />

      <Surface
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.outlineVariant,
          },
        ]}
        elevation={1}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text
              variant="titleMedium"
              numberOfLines={1}
              style={[styles.headerTitle, { color: theme.colors.onSurface }]}
            >
              {ticket.subject}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
              Ticket #{ticket.$id.substring(0, 8)} •{" "}
              {format(new Date(ticket.createdAt), "MMM dd")}
            </Text>
          </View>
          <Chip
            style={{ backgroundColor: statusColor + "15", borderRadius: 8 }}
            textStyle={{ color: statusColor, fontSize: 12, fontWeight: "700" }}
            compact
          >
            {ticket.status.toUpperCase().replace("_", " ")}
          </Chip>
        </View>
        {ticket.status !== "closed" && (
          <Button
            mode="text"
            textColor={theme.colors.error}
            compact
            onPress={handleCloseTicket}
            contentStyle={{
              justifyContent: "flex-start",
              paddingLeft: 0,
              marginLeft: -8,
            }}
          >
            Mark as Resolved
          </Button>
        )}
      </Surface>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.systemMessage}>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.outline,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              You started this conversation
            </Text>
            <Surface
              style={[
                styles.originalReq,
                { backgroundColor: theme.colors.surfaceVariant },
              ]}
              elevation={0}
            >
              <Text
                variant="bodyMedium"
                style={{
                  fontStyle: "italic",
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                &quot;{ticket.message}&quot;
              </Text>
            </Surface>
          </View>
        )}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={{ backgroundColor: theme.colors.surface }}
      >
        {ticket.status !== "closed" ? (
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.outlineVariant,
              },
            ]}
          >
            <TextInput
              mode="outlined"
              placeholder="Type your message..."
              value={replyText}
              onChangeText={setReplyText}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceVariant,
                },
              ]}
              multiline
              dense
              contentStyle={{
                paddingTop: 8,
                paddingBottom: 8,
                color: theme.colors.onSurface,
              }}
              outlineStyle={{ borderRadius: 24, borderWidth: 0 }}
              placeholderTextColor={theme.colors.outline}
              right={
                <TextInput.Icon icon="paperclip" color={theme.colors.outline} />
              }
            />
            <IconButton
              icon="send"
              mode="contained"
              containerColor={theme.colors.primary}
              iconColor={theme.colors.onPrimary}
              size={24}
              onPress={handleSendReply}
              loading={isSending}
              disabled={isSending || !replyText.trim()}
              style={styles.sendButton}
            />
          </View>
        ) : (
          <View
            style={[
              styles.closedFooter,
              {
                backgroundColor: theme.colors.surfaceVariant,
                borderTopColor: theme.colors.outlineVariant,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={20}
              color={theme.colors.secondary}
            />
            <Text
              variant="bodyMedium"
              style={{
                marginLeft: 8,
                color: theme.colors.secondary,
                fontWeight: "500",
              }}
            >
              This conversation has been resolved.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
      <SafeAreaView
        edges={["bottom"]}
        style={{ backgroundColor: theme.colors.surface }}
      />
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
    // backgroundColor: "#fff", // Handled inline
    borderBottomWidth: 1,
    // borderBottomColor: "#f0f0f0", // Handled inline
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  systemMessage: {
    alignItems: "center",
    marginVertical: 16,
  },
  originalReq: {
    padding: 12,
    // backgroundColor: "#f5f5f5", // Handled inline
    borderRadius: 12,
    maxWidth: "90%",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  messageRowLeft: {
    alignSelf: "flex-start",
  },
  messageRowRight: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  bubble: {
    padding: 12,
    maxWidth: "75%",
    borderRadius: 20,
  },
  bubbleLeft: {
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    borderBottomRightRadius: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    // borderTopColor: "#f0f0f0", // Handled inline
    // backgroundColor: "#fff", // Handled inline
    gap: 8,
  },
  input: {
    flex: 1,
    // backgroundColor: "#f5f5f5", // Handled inline
    maxHeight: 100,
    borderRadius: 24,
  },
  sendButton: {
    margin: 0,
  },
  closedFooter: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#f9f9f9", // Handled inline
    borderTopWidth: 1,
    // borderTopColor: "#eee", // Handled inline
  },
});
