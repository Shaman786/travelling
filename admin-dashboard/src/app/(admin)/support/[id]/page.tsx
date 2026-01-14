"use client";
import Button from "@/components/ui/button/Button";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = useCallback(async () => {
    try {
      const doc = await databases.getDocument(DATABASE_ID, TABLES.TICKETS, id);
      setTicket(doc);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      alert("Failed to load ticket details.");
      router.push("/support");
    }
  }, [id, router]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TABLES.MESSAGES,
        [Query.equal("ticketId", id), Query.orderAsc("createdAt")],
      );
      setMessages(response.documents);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [id]);

  const refreshData = useCallback(async () => {
    await Promise.all([fetchTicket(), fetchMessages()]);
    setLoading(false);
  }, [fetchTicket, fetchMessages]);

  useEffect(() => {
    if (id) {
      refreshData();
      // Poll for new messages every 10 seconds
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [id, refreshData, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    setSending(true);
    try {
      // 1. Create Message
      await databases.createDocument(
        DATABASE_ID,
        TABLES.MESSAGES,
        ID.unique(),
        {
          ticketId: id,
          senderId: "admin",
          senderName: "Support Team",
          message: replyText.trim(),
          isAdmin: true,
          createdAt: new Date().toISOString(),
        },
      );

      // 2. Update Ticket Status if needed (Optional, but good practice)
      if (ticket.status === "open") {
        await databases.updateDocument(DATABASE_ID, TABLES.TICKETS, id, {
          status: "in_progress",
          updatedAt: new Date().toISOString(),
        });
        setTicket((prev: any) => ({ ...prev, status: "in_progress" }));
      }

      setReplyText("");
      fetchMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Failed to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Change status to ${newStatus}?`)) return;
    try {
      await databases.updateDocument(DATABASE_ID, TABLES.TICKETS, id, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      setTicket((prev: any) => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-t-brand-500 h-8 w-8 animate-spin rounded-full border-4 border-gray-200"></div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-100px)] max-w-4xl flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white/90">
            {ticket.subject}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ticket #{ticket.$id} • {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase ${
              ticket.status === "open"
                ? "bg-blue-100 text-blue-800"
                : ticket.status === "resolved"
                  ? "bg-green-100 text-green-800"
                  : ticket.status === "closed"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {ticket.status.replace("_", " ")}
          </span>
          <select
            className="focus:ring-brand-500 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-black/20">
        {/* Original Ticket Description */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-2 text-xs font-bold text-gray-500 uppercase">
              Original Request
            </p>
            <p className="text-gray-800 dark:text-gray-200">{ticket.message}</p>
          </div>
        </div>

        {messages.map((msg) => {
          const isAdmin = msg.isAdmin;
          return (
            <div
              key={msg.$id}
              className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  isAdmin
                    ? "bg-brand-600 rounded-br-none text-white"
                    : "rounded-bl-none border border-gray-200 bg-white text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-4">
                  <span
                    className={`text-xs font-bold ${isAdmin ? "text-brand-100" : "text-brand-600 dark:text-brand-400"}`}
                  >
                    {msg.senderName} {isAdmin && "(Support)"}
                  </span>
                  <span
                    className={`text-[10px] ${isAdmin ? "text-brand-200" : "text-gray-400"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4">
        {ticket.status === "closed" ? (
          <div className="rounded-lg border border-gray-200 bg-gray-100 p-4 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            This ticket is closed. Re-open it to send a reply.
          </div>
        ) : (
          <div className="flex gap-2">
            <textarea
              className="focus:ring-brand-500 flex-1 rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-white"
              placeholder="Type your reply here..."
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
            />
            <Button
              className="bg-brand-600 hover:bg-brand-700 h-auto px-6 text-white"
              onClick={handleSendReply}
              disabled={sending || !replyText.trim()}
            >
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
