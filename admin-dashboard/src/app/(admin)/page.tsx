"use client";
import {
  BookingIcon,
  GridIcon, // Using as package icon placeholder
  UserIcon, // Using as user icon placeholder
} from "@/icons";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { Query } from "appwrite";
import Link from "next/link";
import { useEffect, useState } from "react";

// Premium Stats Card with gradient backgrounds and trend indicators
const StatsCard = ({
  title,
  value,
  icon,
  gradient,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  trend?: { value: number; isUp: boolean };
}) => (
  <div
    className={`group relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${gradient}`}
  >
    {/* Background pattern overlay */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/20" />
      <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10" />
    </div>

    <div className="relative z-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              trend.isUp ? "bg-green-400/20" : "bg-red-400/20"
            }`}
          >
            <span>{trend.isUp ? "↑" : "↓"}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <h4 className="mb-1 text-3xl font-bold tracking-tight">{value}</h4>
      <p className="text-sm font-medium text-white/80">{title}</p>
    </div>
  </div>
);

export default function Home() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    activePackages: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000,
        );
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Queries
        // 1. Packages
        const packages = await databases.listDocuments(
          DATABASE_ID,
          TABLES.PACKAGES,
          [Query.limit(1), Query.equal("isActive", true)],
        );

        // 2. Users (Last 60 Days for trend)
        const usersRes = await databases.listDocuments(
          DATABASE_ID,
          TABLES.USERS,
          [
            Query.greaterThanEqual("$createdAt", sixtyDaysAgo.toISOString()),
            Query.limit(100), // Adjust based on expected volume or just use total for main stat and sample for trend
          ],
        );
        // For total count we need a separate query if we want *all* time, but listDocuments returns 'total'.
        // To save read quotas, we usually do one query. But standard list returns total.
        // We need total count AND trend. valid strategy:
        // A. Get Total (limit 0) -> Stats.totalUsers
        // B. Get Recent (limit 100, > 60d) -> Compute Trend.
        // Let's do B for trend, and A for total.
        const usersTotalRes = await databases.listDocuments(
          DATABASE_ID,
          TABLES.USERS,
          [Query.limit(0)],
        );

        // 3. Bookings (Last 60 Days for Revenue & Trend)
        const bookingsRes = await databases.listDocuments(
          DATABASE_ID,
          TABLES.BOOKINGS,
          [
            Query.greaterThanEqual("$createdAt", sixtyDaysAgo.toISOString()),
            Query.limit(500),
            Query.orderDesc("$createdAt"),
          ],
        );
        // Total bookings count
        const bookingsTotalRes = await databases.listDocuments(
          DATABASE_ID,
          TABLES.BOOKINGS,
          [Query.limit(0)],
        );

        // --- Calculate Trends ---

        const calculateTrend = (
          items: any[],
          valueCallback: (item: any) => number = () => 1,
        ) => {
          const currentPeriod = items.filter(
            (i) => new Date(i.$createdAt) >= thirtyDaysAgo,
          );
          const prevPeriod = items.filter(
            (i) =>
              new Date(i.$createdAt) < thirtyDaysAgo &&
              new Date(i.$createdAt) >= sixtyDaysAgo,
          );

          const currentTotal = currentPeriod.reduce(
            (acc, item) => acc + valueCallback(item),
            0,
          );
          const prevTotal = prevPeriod.reduce(
            (acc, item) => acc + valueCallback(item),
            0,
          );

          if (prevTotal === 0)
            return { value: currentTotal > 0 ? 100 : 0, isUp: true };

          const change = ((currentTotal - prevTotal) / prevTotal) * 100;
          return { value: Math.round(Math.abs(change)), isUp: change >= 0 };
        };

        // Revenue Trend (Only confirmed bookings)
        const confirmedBookings = bookingsRes.documents.filter(
          (b: any) => b.status === "confirmed" || b.status === "completed",
        );
        const revenueTrend = calculateTrend(
          confirmedBookings,
          (b) => b.totalPrice || 0,
        );
        const totalRevenue = confirmedBookings.reduce(
          (acc: number, b: any) => acc + (b.totalPrice || 0),
          0,
        ); // Note: This is 60-day revenue. For TOTAL Lifetime revenue we need aggregation or separate query. Assuming "Total Revenue" on dashboard usually implies Lifetime. Implementation trade-off: calculating lifetime client-side is expensive. Let's use 60-day for now or rough estimate.
        // BETTER: Fetch all confirmed bookings with limit(5000) for revenue if possible, or just accept this is "Recent Revenue".
        // Let's stick to 60-day revenue for "Active" feel or if we can fetch total, we need a function.
        // Workaround: We will use the fetched 60-day confirmed bookings for trend, but for the "Total Revenue" card verify if we can get a sum. Appwrite has no Sum API yet.
        // We will display 60-Day Revenue for now as "Recent Revenue" or just Revenue.

        // Bookings Trend
        const bookingsTrend = calculateTrend(bookingsRes.documents);

        // Users Trend
        const usersTrend = calculateTrend(usersRes.documents);

        setStats({
          totalRevenue: totalRevenue, // Displaying 60-day revenue to match trend context
          totalBookings: bookingsTotalRes.total,
          totalUsers: usersTotalRes.total,
          activePackages: packages.total,
          revenueTrend,
          bookingsTrend,
          usersTrend,
        } as any);

        setRecentBookings(bookingsRes.documents.slice(0, 5));
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, Admin. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Revenue (Last 60d)"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={<span className="text-xl font-bold">$</span>}
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          trend={(stats as any).revenueTrend}
        />
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={<BookingIcon className="h-6 w-6" />}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          trend={(stats as any).bookingsTrend}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<UserIcon className="h-6 w-6" />}
          gradient="bg-gradient-to-br from-violet-500 to-purple-600"
          trend={(stats as any).usersTrend}
        />
        <StatsCard
          title="Active Packages"
          value={stats.activePackages}
          icon={<GridIcon className="h-6 w-6" />}
          gradient="bg-gradient-to-br from-orange-500 to-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Bookings */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 lg:col-span-2 dark:border-gray-800 dark:bg-white/5">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
              Recent Bookings
            </h3>
            <Link
              href="/bookings"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="py-3 font-medium">Package</th>
                  <th className="py-3 font-medium">Customer</th>
                  <th className="py-3 font-medium">Amount</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : recentBookings.length > 0 ? (
                  recentBookings.map((b) => (
                    <tr key={b.$id}>
                      <td className="py-3 text-gray-800 dark:text-white/90">
                        {b.packageName}
                      </td>
                      <td className="py-3">{b.userId}</td>
                      <td className="py-3">${b.totalPrice}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            b.status === "confirmed"
                              ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                              : b.status === "pending"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                                : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center">
                      No recent bookings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="h-fit rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/5">
          <h3 className="mb-4 text-lg font-bold text-gray-800 dark:text-white/90">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/packages/create"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30"
            >
              <span className="text-lg">✨</span>
              Create New Package
            </Link>
            <Link
              href="/bookings"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              <span className="text-lg">📦</span>
              View Bookings
            </Link>
            <Link
              href="/users"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
            >
              <span className="text-lg">👥</span>
              Manage Users
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
