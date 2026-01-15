"use client";

import { DATABASE_ID, TABLES, client, databases } from "@/lib/appwrite";
import { ID, Models, Query } from "appwrite";
import { useEffect, useRef, useState } from "react";

interface Message extends Models.Document {
  conversationId: string;
  senderId: string;
  senderName?: string;
  content: string;
  read: boolean;
  createdAt: string; // Appwrite returns string
}

interface Conversation {
  id: string; // conversationId
  userId: string;
  userName: string; // from senderName or derived
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations (Group messages by conversationId)
  // Since we don't have a conversations table, we fetch recent messages and aggregate.
  const fetchConversations = async () => {
    try {
      // Fetch reasonably large number of recent messages to rebuild state
      const response = await databases.listDocuments(
        DATABASE_ID,
        TABLES.CHAT_MESSAGES,
        [Query.orderDesc("$createdAt"), Query.limit(200)],
      );

      const convMap = new Map<string, Conversation>();

      response.documents.forEach((doc) => {
        const msg = doc as unknown as Message;
        if (!convMap.has(msg.conversationId)) {
          convMap.set(msg.conversationId, {
            id: msg.conversationId,
            userId: msg.conversationId.replace("_admin", ""), // heuristic
            userName: msg.senderName || "User",
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
            unreadCount: 0,
          });
        }

        // Update unw read count if not from admin (assuming admin senderId is 'admin' or starts with 'admin')
        // We need to know OUR userId. For now assume any message NOT from us (senderId != 'admin') is unread if read=false.
        // Actually, we'll fetch current user ID in useEffect.
      });

      setConversations(Array.from(convMap.values()));
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch conversations", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetching data on mount is an accepted pattern
    fetchConversations();

    // Subscribe to all messages to update conversation list live
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${TABLES.CHAT_MESSAGES}.documents`,
      (response) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create",
          )
        ) {
          const payload = response.payload as unknown as Message;

          setConversations((prev) => {
            const existingIndex = prev.findIndex(
              (c) => c.id === payload.conversationId,
            );
            const newConv: Conversation = {
              id: payload.conversationId,
              userId: payload.conversationId.replace("_admin", ""),
              userName: payload.senderName || "User",
              lastMessage: payload.content,
              lastMessageAt: payload.$createdAt, // Use payload creation time
              unreadCount: 0, // Simplified for now
            };

            if (existingIndex > -1) {
              const updated = [...prev];
              updated[existingIndex] = newConv;
              return updated.sort(
                (a, b) =>
                  new Date(b.lastMessageAt).getTime() -
                  new Date(a.lastMessageAt).getTime(),
              );
            } else {
              return [newConv, ...prev];
            }
          });

          // If currently selected, append message
          if (
            selectedConversation &&
            payload.conversationId === selectedConversation.id
          ) {
            setMessages((prev) => [payload, ...prev]);
          }
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [selectedConversation]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          TABLES.CHAT_MESSAGES,
          [
            Query.equal("conversationId", selectedConversation.id),
            Query.orderDesc("$createdAt"),
            Query.limit(50),
          ],
        );
        setMessages(response.documents as unknown as Message[]);
      } catch (error) {
        console.error("Failed to fetch chat history", error);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  const handleSend = async () => {
    if (!replyText.trim() || !selectedConversation) return;

    try {
      const payload = {
        conversationId: selectedConversation.id,
        senderId: "admin", // Hardcoded admin ID effectively
        senderName: "Support Agent",
        content: replyText,
        read: false, // User hasn't read it yet
        createdAt: new Date().toISOString(),
      };

      await databases.createDocument(
        DATABASE_ID,
        TABLES.CHAT_MESSAGES,
        ID.unique(),
        payload,
      );

      setReplyText("");
      // Optimistic update handled by subscription mostly, but we can append locally too
      // setMessages(prev => [createdDoc, ...prev]);
    } catch (error) {
      console.error("Send failed", error);
      alert("Failed to send message");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Conversation List */}
      <div className="flex w-1/3 flex-col border-r bg-white">
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <h2 className="text-xl font-bold text-gray-800">Inbox</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading chats...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`cursor-pointer border-b p-4 transition-colors hover:bg-gray-50 ${
                  selectedConversation?.id === conv.id
                    ? "border-blue-200 bg-blue-50"
                    : ""
                }`}
              >
                <div className="mb-1 flex justify-between">
                  <span className="font-semibold text-gray-900">
                    {conv.userName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="truncate text-sm text-gray-600">
                  {conv.lastMessage}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedConversation.userName}
                </h3>
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>{" "}
                  Online
                </span>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex flex-1 flex-col-reverse space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="mt-10 text-center text-gray-400">
                  No messages yet
                </div>
              )}
              {messages.map((msg) => {
                const isAdmin = msg.senderId === "admin";
                return (
                  <div
                    key={msg.$id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                        isAdmin
                          ? "rounded-br-none bg-blue-600 text-white"
                          : "rounded-bl-none border bg-white text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p
                        className={`mt-1 text-right text-[10px] ${isAdmin ? "text-blue-100" : "text-gray-400"}`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Type a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                  className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
            <svg
              className="mb-4 h-20 w-20 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-xl">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
