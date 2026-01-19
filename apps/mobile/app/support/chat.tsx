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
import { useTheme } from "react-native-paper"; // Added useTheme
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useChat } from "../../src/hooks/useChat";
import { useStore } from "../../src/store/useStore";

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme(); // Use theme hook
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
      }));
      setGiftedMessages(mapped);
    }
  }, [messages]);

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const text = newMessages[0].text;
      try {
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
            backgroundColor: theme.colors.primary,
          },
          left: {
            backgroundColor: theme.colors.surfaceVariant,
          },
        }}
        textStyle={{
          right: { color: theme.colors.onPrimary },
          left: { color: theme.colors.onSurfaceVariant },
        }}
        timeTextStyle={{
          right: { color: theme.colors.onPrimaryContainer }, // Subtle text on primary
          left: { color: theme.colors.outline },
        }}
      />
    );
  };

  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={{ marginBottom: 10, marginRight: 10 }}>
        <Ionicons name="send" size={24} color={theme.colors.primary} />
      </View>
    </Send>
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Expert Chat",
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
          headerShadowVisible: false,
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
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.onSurface}
              />
            </MotiPressable>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
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
            placeholderTextColor: theme.colors.outline,
            style: {
              color: theme.colors.onSurface,
              paddingTop: 8,
              paddingHorizontal: 10,
            },
          }}
        />
      )}
      {Platform.OS === "android" && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
