import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { MotiPressable } from "moti/interactions";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { Bubble, GiftedChat, IMessage, Send } from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChat } from "../../src/hooks/useChat";
import { useStore } from "../../src/store/useStore";

const COLORS = {
  primary: "#6C63FF",
  background: "#0F172A",
  card: "#1E293B",
  text: "#F8FAFC",
  textSecondary: "#94A3B8",
};

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useStore((state) => state.user);

  // Consistent conversation ID
  const conversationId = user?.$id ? `${user.$id}_admin` : "guest_admin";

  const { messages, isLoading, sendMessage } = useChat(
    conversationId,
    user?.$id || "guest",
  );

  const [giftedMessages, setGiftedMessages] = useState<IMessage[]>([]);

  // Memoized animation state
  const animateState = useMemo(
    () =>
      ({ pressed }: { pressed: boolean }) => {
        "worklet";
        return {
          scale: pressed ? 0.9 : 1,
          opacity: pressed ? 0.8 : 1,
        };
      },
    [],
  );

  // Map Appwrite messages to GiftedChat messages
  useEffect(() => {
    if (messages) {
      const mapped: IMessage[] = messages.map((msg) => ({
        _id: msg.$id,
        text: msg.content,
        createdAt: new Date(msg.createdAt || Date.now()),
        user: {
          _id: msg.senderId,
          name: msg.senderName || "User",
        },
        // Mark as sent/received for UI if needed, but GiftedChat handles "user._id" comparison
      }));
      setGiftedMessages(mapped);
    }
  }, [messages]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const text = newMessages[0].text;
      try {
        // Optimistically update is handled by GiftedChat usually, but with Realtime
        // we might see double if we append manually + receive event.
        // GiftedChat allows appending manually:
        // setGiftedMessages(previous => GiftedChat.append(previous, newMessages))

        // We will rely on real-time hook to update the list, or append optimally.
        // Let's just send.
        await sendMessage(text, user?.name || "Guest");
      } catch (error) {
        console.error("Send failed", error);
      }
    },
    [sendMessage, user],
  );

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: COLORS.primary,
          },
          left: {
            backgroundColor: COLORS.card,
          },
        }}
        textStyle={{
          right: { color: "#FFF" },
          left: { color: "#FFF" },
        }}
        timeTextStyle={{
          right: { color: "rgba(255,255,255,0.7)" },
          left: { color: COLORS.textSecondary },
        }}
      />
    );
  };

  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={{ marginBottom: 10, marginRight: 10 }}>
        <Ionicons name="send" size={24} color={COLORS.primary} />
      </View>
    </Send>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Expert Chat",
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerLeft: () => (
            <MotiPressable
              onPress={() => router.back()}
              style={{ marginLeft: 10 }}
              animate={animateState}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 400,
              }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </MotiPressable>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <GiftedChat
          messages={giftedMessages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: user?.$id || "guest",
            name: user?.name,
          }}
          renderBubble={renderBubble}
          renderSend={renderSend}
          textInputProps={{
            placeholder: "Type a message...",
            placeholderTextColor: COLORS.textSecondary,
            style: { color: COLORS.text }, // Dark mode input
          }}
        />
      )}
      {/* Keyboard fix for Android if needed, though KeyboardAvoidingView wraps usually */}
      {Platform.OS === "android" && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
