"use client";
import { ArrowRightIcon } from "@/icons";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { format } from "date-fns";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchTicket = useCallback(async () => {
    try {
      const data = await databases.getDocument(
        DATABASE_ID,
        (TABLES as any).TICKETS || "tickets",
        id,
      );
      setTicket(data);

      if (data.userId) {
        try {
          const u = await databases.getDocument(
            DATABASE_ID,
            TABLES.USERS,
            data.userId,
          );
          setUser(u);
        } catch {
          console.log("User not found");
        }
      }
    } catch (error) {
      console.error("Error fetching ticket:", error);
      alert("Ticket not found");
      router.push("/tickets");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleUpdate = async (field: string, value: string) => {
    setUpdating(true);
    try {
      await databases.updateDocument(
        DATABASE_ID,
        (TABLES as any).TICKETS || "tickets",
        id,
        {
          [field]: value,
        },
      );
      setTicket((prev: any) => ({ ...prev, [field]: value }));
    } catch (error) {
      console.error("Error updating ticket:", error);
      alert("Failed to update ticket.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-t-brand-500 dark:border-t-brand-400 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/tickets"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5"
          >
            <ArrowRightIcon className="h-5 w-5 rotate-180" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              Ticket Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {ticket.$id}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Message Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
            <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
              {ticket.subject}
            </h3>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-white/5">
              <p className="text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {ticket.message}
              </p>
            </div>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Submitted on {format(new Date(ticket.$createdAt), "PPP 'at' p")}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
            <h3 className="mb-4 text-sm font-bold text-gray-400 uppercase">
              Ticket Details
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleUpdate("status", e.target.value)}
                  disabled={updating}
                  className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <select
                  value={ticket.priority}
                  onChange={(e) => handleUpdate("priority", e.target.value)}
                  disabled={updating}
                  className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <div className="text-sm font-medium text-gray-800 capitalize dark:text-white">
                  {ticket.category.replace("_", " ")}
                </div>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
            <h3 className="mb-4 text-sm font-bold text-gray-400 uppercase">
              User Information
            </h3>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="bg-brand-100 text-brand-600 dark:bg-brand-500/10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-full font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                  <Link
                    href={`/users/${user.$id}`}
                    className="text-brand-500 hover:text-brand-600 mt-1 block text-xs"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">User not found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
