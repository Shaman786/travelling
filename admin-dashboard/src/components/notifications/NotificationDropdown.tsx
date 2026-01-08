"use client";
import { BellIcon } from "@/icons";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { Query } from "appwrite";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  type: "booking" | "ticket" | "review";
  title: string;
  message: string;
  link: string;
  time: Date;
  read: boolean;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const items: Notification[] = [];

      // Fetch recent bookings
      const bookings = await databases.listDocuments(
        DATABASE_ID,
        TABLES.BOOKINGS,
        [Query.orderDesc("$createdAt"), Query.limit(5)],
      );
      bookings.documents.forEach((b: any) => {
        items.push({
          id: `booking-${b.$id}`,
          type: "booking",
          title: "New Booking",
          message: `${b.packageName || "Package"} - $${b.totalPrice}`,
          link: `/bookings/${b.$id}`,
          time: new Date(b.$createdAt),
          read: false,
        });
      });

      // Fetch recent tickets
      try {
        const tickets = await databases.listDocuments(
          DATABASE_ID,
          (TABLES as any).TICKETS || "tickets",
          [Query.orderDesc("$createdAt"), Query.limit(5)],
        );
        tickets.documents.forEach((t: any) => {
          items.push({
            id: `ticket-${t.$id}`,
            type: "ticket",
            title: "Support Ticket",
            message: t.subject,
            link: `/tickets/${t.$id}`,
            time: new Date(t.$createdAt),
            read: false,
          });
        });
      } catch {
        // Tickets collection might not exist
      }

      // Fetch recent reviews
      try {
        const reviews = await databases.listDocuments(
          DATABASE_ID,
          TABLES.REVIEWS,
          [Query.orderDesc("$createdAt"), Query.limit(5)],
        );
        reviews.documents.forEach((r: any) => {
          items.push({
            id: `review-${r.$id}`,
            type: "review",
            title: "New Review",
            message: `${r.rating}★ - "${r.comment?.substring(0, 30) || "No comment"}..."`,
            link: `/reviews`,
            time: new Date(r.$createdAt),
            read: false,
          });
        });
      } catch {
        // Reviews collection might not exist
      }

      // Sort by time descending
      items.sort((a, b) => b.time.getTime() - a.time.getTime());
      setNotifications(items.slice(0, 10));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "booking":
        return "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400";
      case "ticket":
        return "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400";
      case "review":
        return "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 rounded-full px-2 py-0.5 text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="border-t-brand-500 h-6 w-6 animate-spin rounded-full border-2 border-gray-200"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => setIsOpen(false)}
                  className="flex gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${getTypeColor(n.type)}`}
                  >
                    {n.type === "booking" && "📦"}
                    {n.type === "ticket" && "🎫"}
                    {n.type === "review" && "⭐"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {n.title}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      {n.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      {format(n.time, "MMM d, h:mm a")}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2 dark:border-gray-800">
            <Link
              href="/bookings"
              onClick={() => setIsOpen(false)}
              className="text-brand-500 hover:text-brand-600 block text-center text-xs font-medium"
            >
              View All Activity
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
