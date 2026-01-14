"use client";
import BookingTable from "@/components/bookings/BookingTable";
import ExportButton from "@/components/common/ExportButton";
import SearchInput from "@/components/common/SearchInput";
import { databaseService } from "@/lib/databaseService";
import { useCallback, useEffect, useState } from "react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await databaseService.bookings.list(100);
      setBookings(docs);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Bookings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage incoming travel bookings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput onSearch={setSearch} placeholder="Search bookings..." />
          <ExportButton data={bookings} filename="bookings" />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-t-brand-500 dark:border-t-brand-400 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
        </div>
      ) : (
        <BookingTable bookings={bookings} />
      )}
    </div>
  );
}
