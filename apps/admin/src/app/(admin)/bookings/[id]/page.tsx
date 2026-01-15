"use client";
import EditBookingModal from "@/components/bookings/EditBookingModal";
import Button from "@/components/ui/button/Button";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      const doc = await databases.getDocument(DATABASE_ID, TABLES.BOOKINGS, id);
      setBooking(doc);
      setSelectedStatus(doc.status); // Initialize selected status
    } catch (error) {
      console.error("Error fetching booking:", error);
      alert("Failed to load booking details.");
      router.push("/bookings");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id, fetchBooking]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    if (
      !confirm(`Are you sure you want to update status to ${selectedStatus}?`)
    )
      return;

    setUpdating(true);
    try {
      await databases.updateDocument(DATABASE_ID, TABLES.BOOKINGS, id, {
        status: selectedStatus,
      });
      setBooking((prev: any) => ({ ...prev, status: selectedStatus }));
      alert(`Booking status updated to ${selectedStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleNotifyUser = async () => {
    const message = prompt("Enter notification message for user:");
    if (!message) return;

    // Mock sending notification
    console.log(`Sending notification to user ${booking.userId}: ${message}`);
    alert("Notification sent (Mock)!");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-t-brand-500 h-8 w-8 animate-spin rounded-full border-4 border-gray-200"></div>
      </div>
    );
  }

  if (!booking) return null;

  const travelers = booking.travelers ? JSON.parse(booking.travelers) : [];

  const BOOKING_STATUSES = [
    { value: "pending_payment", label: "Pending Payment" },
    { value: "processing", label: "Processing" },
    { value: "documents_verified", label: "Documents Verified" },
    { value: "visa_submitted", label: "Visa Submitted" },
    { value: "visa_approved", label: "Visa Approved" },
    { value: "ready_to_fly", label: "Ready to Fly" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Booking #<span className="text-sm font-normal">{booking.$id}</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created on {new Date(booking.$createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="block w-full rounded-md border-0 py-1.5 pr-10 pl-3 text-gray-900 ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {BOOKING_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="primary"
            onClick={handleStatusUpdate}
            disabled={updating || selectedStatus === booking.status}
          >
            {updating ? "Updating..." : "Update Status"}
          </Button>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Edit
          </Button>
          <Button variant="outline" onClick={handleNotifyUser}>
            Notify
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Package Details */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Package Inforamtion
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                Package Name
              </label>
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {booking.packageName}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                Total Price
              </label>
              <p className="text-brand-600 dark:text-brand-400 text-base font-medium">
                ${booking.totalPrice?.toLocaleString()}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                Status
              </label>
              <div className="mt-1">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
                    booking.status === "confirmed" ||
                    booking.status === "ready_to_fly"
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : booking.status === "pending" ||
                          booking.status === "processing"
                        ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                        : "bg-red-50 text-red-700 ring-red-600/20"
                  }`}
                >
                  {booking.status
                    ? booking.status.toUpperCase().replace(/_/g, " ")
                    : "UNKNOWN"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                Payment Status
              </label>
              <div className="mt-1">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${
                    booking.paymentStatus === "paid"
                      ? "bg-green-50 text-green-700 ring-green-600/20"
                      : "bg-gray-50 text-gray-600 ring-gray-600/20"
                  }`}
                >
                  {booking.paymentStatus
                    ? booking.paymentStatus.toUpperCase()
                    : "UNPAID"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Customer Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase">
                User ID
              </label>
              <p className="font-mono text-sm text-gray-600 dark:text-gray-300">
                {booking.userId}
              </p>
            </div>
            {/* Can fetch user details here if needed */}
          </div>
        </div>
      </div>

      {/* Travelers */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Travelers ({travelers.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-2 pr-4 font-medium uppercase">Name</th>
                <th className="py-2 pr-4 font-medium uppercase">Age</th>
                <th className="py-2 pr-4 font-medium uppercase">Gender</th>
                {/* Add other fields based on JSON structure */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {travelers.map((t: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 pr-4 font-medium text-gray-800 dark:text-white/90">
                    {t.name || "N/A"}
                  </td>
                  <td className="py-3 pr-4">{t.age || "N/A"}</td>
                  <td className="py-3 pr-4">{t.gender || "N/A"}</td>
                </tr>
              ))}
              {travelers.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-gray-500">
                    No traveler details available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditBookingModal
        booking={booking}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onRefresh={fetchBooking}
      />
    </div>
  );
}
