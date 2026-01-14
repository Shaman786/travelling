"use client";
import SearchInput from "@/components/common/SearchInput";
import TicketTable from "@/components/tickets/TicketTable";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { databaseService } from "@/lib/databaseService";
import { useCallback, useEffect, useState } from "react";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Tickets via Service
      const rawTickets = await databaseService.support.list(100, "all", search);

      // 2. Extract unique User IDs
      const userIds = [...new Set(rawTickets.map((t) => t.userId))];

      // 3. Fetch Users (This part remains manual as it's cross-collection)
      const usersMap: Record<string, string> = {};
      if (userIds.length > 0) {
        await Promise.all(
          userIds.map(async (uid) => {
            try {
              const u = await databases.getDocument(
                DATABASE_ID,
                TABLES.USERS,
                uid,
              );
              usersMap[uid] = u.name;
            } catch {
              usersMap[uid] = "Unknown User";
            }
          }),
        );
      }

      // 4. Enrich Data
      const enriched = rawTickets.map((t: any) => ({
        ...t,
        userName: usersMap[t.userId] || t.userId,
      }));

      setTickets(enriched);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Support Tickets
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage user support requests and issues.
          </p>
        </div>
        <SearchInput onSearch={setSearch} placeholder="Search tickets..." />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-t-brand-500 dark:border-t-brand-400 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
        </div>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}
