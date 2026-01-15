import { useCallback, useEffect, useRef, useState } from "react";
import { client, DATABASE_ID, TABLES } from "../lib/appwrite";
import { chatService } from "../lib/databaseService";
import { Message } from "../types";

export const useChat = (conversationId: string, currentUserId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    const initial = await chatService.getMessages(conversationId);
    setMessages(initial);
    setIsLoading(false);
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to Realtime
    // Channel: databases.[DATABASE_ID].collections.[COLLECTION_ID].documents
    const channel = `databases.${DATABASE_ID}.collections.${TABLES.CHAT_MESSAGES}.documents`;

    console.log("Subscribing to chat channel:", channel);

    unsubscribeRef.current = client.subscribe(channel, (response) => {
      // Check if it's a create event
      const isCreate = response.events.some((event) =>
        event.endsWith(".create")
      );

      if (isCreate) {
        const payload = response.payload as any;

        // Filter by conversationId (Realtime sends ALL document events for the collection)
        if (payload.conversationId === conversationId) {
          // Normalize payload to Message type
          const newMessage: Message = {
            ...payload,
            createdAt: payload.$createdAt,
            id: payload.$id, // Ensure ID mapping if needed
          };

          // Avoid duplicates (if optimistic update was used)
          setMessages((prev) => {
            if (prev.some((m) => m.$id === newMessage.$id)) return prev;
            return [newMessage, ...prev];
          });
        }
      }
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [conversationId, fetchMessages]);

  const sendMessage = async (content: string, senderName?: string) => {
    try {
      await chatService.sendMessage(
        conversationId,
        currentUserId,
        content,
        senderName
      );
    } catch (error) {
      console.error("Failed to send message", error);
      throw error;
    }
  };

  return { messages, isLoading, sendMessage };
};
