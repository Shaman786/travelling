"use client";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { format } from "date-fns";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Payment {
  $id: string;
  $createdAt: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  gatewayProvider?: string;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  status: string;
  method?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  metadata?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-purple-100 text-purple-800",
};

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [showRefundModal, setShowRefundModal] = useState(false);

  const fetchPayment = useCallback(async () => {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        TABLES.PAYMENTS || "payments",
        paymentId,
      );
      setPayment(doc as unknown as Payment);
    } catch (error) {
      console.error("Error fetching payment:", error);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  const handleRefund = async () => {
    if (!payment) return;
    setRefunding(true);
    try {
      await databases.updateDocument(
        DATABASE_ID,
        TABLES.PAYMENTS || "payments",
        paymentId,
        {
          status: "refunded",
          refundId: `REF_${Date.now()}`,
          refundAmount: payment.amount,
          refundReason: refundReason || "Admin initiated refund",
        },
      );
      // Also update booking payment status
      try {
        await databases.updateDocument(
          DATABASE_ID,
          TABLES.BOOKINGS,
          payment.bookingId,
          { paymentStatus: "refunded" },
        );
      } catch {
        // Booking update optional
      }
      setShowRefundModal(false);
      fetchPayment();
    } catch (error) {
      console.error("Refund error:", error);
      alert("Failed to process refund");
    } finally {
      setRefunding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="border-t-brand-500 h-12 w-12 animate-spin rounded-full border-4 border-gray-200"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Payment not found.</p>
        <Link href="/payments" className="text-brand-500 hover:underline">
          Back to Payments
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
        >
          ← Back to Payments
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Details
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLORS[payment.status] || "bg-gray-100"}`}
          >
            {payment.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Info */}
        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Transaction Details
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Payment ID</dt>
              <dd className="font-mono text-gray-900 dark:text-white">
                {payment.$id}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Amount</dt>
              <dd className="text-xl font-bold text-gray-900 dark:text-white">
                {payment.currency} {payment.amount.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Gateway</dt>
              <dd className="text-gray-900 dark:text-white">
                {payment.gatewayProvider || "Not set"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Method</dt>
              <dd className="text-gray-900 dark:text-white">
                {payment.method || "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Date</dt>
              <dd className="text-gray-900 dark:text-white">
                {format(new Date(payment.$createdAt), "PPpp")}
              </dd>
            </div>
          </dl>
        </div>

        {/* Gateway Info */}
        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Gateway Details
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Order ID</dt>
              <dd className="font-mono text-sm text-gray-900 dark:text-white">
                {payment.gatewayOrderId || "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Payment ID</dt>
              <dd className="font-mono text-sm text-gray-900 dark:text-white">
                {payment.gatewayPaymentId || "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Signature</dt>
              <dd className="max-w-[200px] truncate font-mono text-sm text-gray-900 dark:text-white">
                {payment.gatewaySignature || "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Related Links */}
        <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Related
          </h2>
          <div className="space-y-2">
            <Link
              href={`/bookings/${payment.bookingId}`}
              className="text-brand-500 block hover:underline"
            >
              View Booking →
            </Link>
            <Link
              href={`/users/${payment.userId}`}
              className="text-brand-500 block hover:underline"
            >
              View User →
            </Link>
          </div>
        </div>

        {/* Refund Section */}
        {payment.status === "completed" && (
          <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Refund
            </h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Process a full refund for this payment.
            </p>
            <button
              onClick={() => setShowRefundModal(true)}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Initiate Refund
            </button>
          </div>
        )}

        {/* Refund Info (if refunded) */}
        {payment.status === "refunded" && (
          <div className="rounded-xl bg-purple-50 p-6 shadow dark:bg-purple-900/20">
            <h2 className="mb-4 text-lg font-semibold text-purple-900 dark:text-purple-300">
              Refund Details
            </h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-purple-700 dark:text-purple-400">
                  Refund ID
                </dt>
                <dd className="font-mono text-purple-900 dark:text-purple-200">
                  {payment.refundId}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-purple-700 dark:text-purple-400">Amount</dt>
                <dd className="font-bold text-purple-900 dark:text-purple-200">
                  {payment.currency} {payment.refundAmount?.toLocaleString()}
                </dd>
              </div>
              {payment.refundReason && (
                <div>
                  <dt className="text-purple-700 dark:text-purple-400">
                    Reason
                  </dt>
                  <dd className="text-purple-900 dark:text-purple-200">
                    {payment.refundReason}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
              Confirm Refund
            </h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              This will refund {payment.currency} {payment.amount} to the
              customer.
            </p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund (optional)"
              className="mb-4 w-full rounded-lg border p-3 dark:border-gray-600 dark:bg-gray-700"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {refunding ? "Processing..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
