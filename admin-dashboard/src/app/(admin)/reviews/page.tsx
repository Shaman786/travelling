"use client";
import ReviewTable from "@/components/reviews/ReviewTable";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useEffect, useState } from "react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // 1. Fetch Reviews
      const response = await databases.listDocuments(
        DATABASE_ID,
        TABLES.REVIEWS,
        [Query.orderDesc("$createdAt")],
      );
      const rawReviews = response.documents;

      // 2. Extract unique IDs
      const userIds = [...new Set(rawReviews.map((r) => r.userId))];
      const packageIds = [...new Set(rawReviews.map((r) => r.packageId))];

      // 3. Fetch related data (Naive approach: Parallel fetches. Ideal: Bulk fetch if supported or cached)
      // Note: Appwrite's listDocuments with Query.equal('$id', [...]) is supported in newer versions.
      // We'll try to fetch individually for safety or use a lookup if lists are small.
      // For a robust admin dashboard, we often assume we can fetch counts.
      // Let's rely on simple Maps for now.

      const usersMap: Record<string, string> = {};
      const packagesMap: Record<string, string> = {};

      // Fetch Users
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

      // Fetch Packages
      await Promise.all(
        packageIds.map(async (pid) => {
          try {
            const p = await databases.getDocument(
              DATABASE_ID,
              TABLES.PACKAGES,
              pid,
            );
            packagesMap[pid] = p.title;
          } catch {
            packagesMap[pid] = "Unknown Package";
          }
        }),
      );

      // 4. Enrich Data
      const enriched = rawReviews.map((r) => ({
        ...r,
        userName: usersMap[r.userId] || r.userId,
        packageName: packagesMap[r.packageId] || r.packageId,
      }));

      setReviews(enriched);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await databases.updateDocument(DATABASE_ID, TABLES.REVIEWS, id, {
        status: newStatus,
      });
      setReviews((prev) =>
        prev.map((r) => (r.$id === id ? { ...r, status: newStatus } : r)),
      );
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setUpdatingId(id);
    try {
      await databases.deleteDocument(DATABASE_ID, TABLES.REVIEWS, id);
      setReviews((prev) => prev.filter((r) => r.$id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Reviews
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Moderate and manage user reviews.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-t-brand-500 dark:border-t-brand-400 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
        </div>
      ) : (
        <ReviewTable
          reviews={reviews}
          onApprove={(id) => handleStatusUpdate(id, "approved")}
          onReject={(id) => handleStatusUpdate(id, "rejected")}
          onDelete={handleDelete}
          updatingId={updatingId}
        />
      )}
    </div>
  );
}
