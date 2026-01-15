"use client";
import BookingTable from "@/components/bookings/BookingTable";
import { UserIcon } from "@/icons";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { Query } from "appwrite";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserAndBookings = useCallback(async () => {
    try {
      // 1. Fetch User Profile
      const userDoc = await databases.getDocument(
        DATABASE_ID,
        TABLES.USERS,
        id,
      );
      setUser(userDoc);

      // 2. Fetch User Bookings
      const bookingsResponse = await databases.listDocuments(
        DATABASE_ID,
        TABLES.BOOKINGS,
        [Query.equal("userId", id), Query.orderDesc("$createdAt")],
      );
      setUserBookings(bookingsResponse.documents);
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Failed to load user details.");
      router.push("/users");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchUserAndBookings();
    }
  }, [id, fetchUserAndBookings]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-t-brand-500 h-8 w-8 animate-spin rounded-full border-4 border-gray-200"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* Profile Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-gray-100 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <UserIcon className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
              {user.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3 sm:justify-start">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                Phone: {user.phone || "N/A"}
              </span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                Joined: {new Date(user.$createdAt).toLocaleDateString()}
              </span>
              <span className="bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 rounded-full px-3 py-1 text-xs font-medium">
                {userBookings.length} Bookings
              </span>
            </div>
            {user.pushToken && (
              <p className="mt-2 max-w-xs truncate text-xs text-gray-400">
                Push Token: {user.pushToken}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Booking History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
          Booking History
        </h2>
        <BookingTable bookings={userBookings} />
      </div>
    </div>
  );
}
