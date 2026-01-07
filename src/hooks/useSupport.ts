/**
 * useSupport Hook
 * 
 * React hook for managing support tickets.
 * Handles creating tickets and fetching ticket history.
 */

import { useCallback, useState } from "react";
import { isAppwriteConfigured } from "../lib/appwrite";
import { supportService } from "../lib/databaseService";
import { useStore } from "../store/useStore";
import type { SupportTicket } from "../types";

interface CreateTicketPayload {
  subject: string;
  message: string;
  category: SupportTicket["category"];
  priority: SupportTicket["priority"];
  bookingId?: string;
}

interface UseSupportReturn {
  tickets: SupportTicket[];
  isLoading: boolean;
  error: string | null;
  createTicket: (data: CreateTicketPayload) => Promise<boolean>;
  fetchTickets: () => Promise<void>;
}

export function useSupport(): UseSupportReturn {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const user = useStore((state) => state.user);

  const fetchTickets = useCallback(async () => {
    if (!user?.$id) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isAppwriteConfigured()) {
        const fetchedTickets = await supportService.getUserTickets(user.$id);
        setTickets(fetchedTickets);
      } else {
        // Mock data
        setTickets([
          {
            $id: "mock_ticket_1",
            $collectionId: "mock_tickets",
            $databaseId: "mock_db",
            $permissions: [],
            $sequence: 0,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            userId: user.$id,
            subject: "Help with booking",
            message: "I need to change my dates",
            category: "booking",
            status: "open",
            priority: "medium",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch tickets");
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id]);

  const createTicket = useCallback(async (
    data: CreateTicketPayload
  ): Promise<boolean> => {
    if (!user?.$id) {
      setError("You must be logged in to create a ticket");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isAppwriteConfigured()) {
        const newTicket = await supportService.createTicket({
          ...data,
          userId: user.$id,
          status: "open",
        } as any);
        setTickets((prev) => [newTicket, ...prev]);
      } else {
        // Mock creation
        const mockTicket: SupportTicket = {
          $id: `mock_ticket_${Date.now()}`,
          $collectionId: "mock_tickets",
          $databaseId: "mock_db",
          $permissions: [],
          $sequence: 0,
          $createdAt: new Date().toISOString(),
          $updatedAt: new Date().toISOString(),
          userId: user.$id,
          ...data,
          status: "open",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTickets((prev) => [mockTicket, ...prev]);
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to create ticket");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.$id]);

  return {
    tickets,
    isLoading,
    error,
    createTicket,
    fetchTickets,
  };
}

export default useSupport;
