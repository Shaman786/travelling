"use client";
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

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "booking":
        return {
          bg: "bg-green-100 dark:bg-green-500/10",
          text: "text-green-600 dark:text-green-400",
          emoji: "📦",
        };
      case "ticket":
        return {
          bg: "bg-orange-100 dark:bg-orange-500/10",
          text: "text-orange-600 dark:text-orange-400",
          emoji: "🎫",
        };
      case "review":
        return {
          bg: "bg-blue-100 dark:bg-blue-500/10",
          text: "text-blue-600 dark:text-blue-400",
          emoji: "⭐",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          emoji: "📌",
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0 z-10 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full -right-[240px] z-50 mt-4 flex h-auto max-h-[480px] w-[350px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg sm:w-[361px] lg:right-0 dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Notifications
            </h5>
            {unreadCount > 0 && (
              <span className="bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 rounded-full px-2 py-0.5 text-xs font-medium">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="border-t-brand-500 h-6 w-6 animate-spin rounded-full border-2 border-gray-200"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No recent activity.
              </div>
            ) : (
              <ul className="custom-scrollbar">
                {notifications.map((n) => {
                  const styles = getTypeStyles(n.type);
                  return (
                    <li key={n.id}>
                      <Link
                        href={n.link}
                        onClick={() => setIsOpen(false)}
                        className="flex gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${styles.bg}`}
                        >
                          {styles.emoji}
                        </span>
                        <span className="block flex-1 overflow-hidden">
                          <span className="mb-1 block text-sm font-medium text-gray-800 dark:text-white/90">
                            {n.title}
                          </span>
                          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                            {n.message}
                          </span>
                          <span className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <span className="capitalize">{n.type}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                            <span>{format(n.time, "MMM d, h:mm a")}</span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <Link
            href="/bookings"
            onClick={() => setIsOpen(false)}
            className="block border-t border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            View All Activity
          </Link>
        </div>
      )}
    </div>
  );
}
