"use client";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { Query } from "appwrite";
import { format } from "date-fns";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface Payment {
  $id: string;
  $createdAt: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  gatewayProvider?: string;
  gatewayPaymentId?: string;
  status: string;
  method?: string;
  refundId?: string;
  refundAmount?: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const queries = [Query.orderDesc("$createdAt"), Query.limit(100)];
      if (filter !== "all") {
        queries.push(Query.equal("status", filter));
      }
      const response = await databases.listDocuments(
        DATABASE_ID,
        TABLES.PAYMENTS || "payments",
        queries,
      );
      setPayments(response.documents as unknown as Payment[]);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Calculate stats
  const totalAmount = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const refundedAmount = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + (p.refundAmount || p.amount), 0);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage payment transactions and refunds
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-green-600">
            ${totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending Payments
          </p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Refunds
          </p>
          <p className="text-2xl font-bold text-purple-600">
            ${refundedAmount.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Transactions
          </p>
          <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {["all", "pending", "completed", "failed", "refunded"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              filter === status
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Payment ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Gateway
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  <div className="flex justify-center">
                    <div className="border-t-brand-500 h-8 w-8 animate-spin rounded-full border-4 border-gray-200"></div>
                  </div>
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No payments found.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr
                  key={payment.$id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {payment.$id.substring(0, 8)}...
                    </span>
                    {payment.gatewayPaymentId && (
                      <p className="text-xs text-gray-500">
                        {payment.gatewayPaymentId}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {payment.gatewayProvider || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {payment.method || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[payment.status] || "bg-gray-100 text-gray-800"}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-600 dark:text-gray-300">
                    {format(new Date(payment.$createdAt), "MMM dd, yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/payments/${payment.$id}`}
                      className="text-brand-500 hover:text-brand-600"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
