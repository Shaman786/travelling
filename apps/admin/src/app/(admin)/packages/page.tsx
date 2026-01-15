"use client";
import PackageTable from "@/components/packages/PackageTable";
import Button from "@/components/ui/button/Button";
import { PlusIcon } from "@/icons"; // Verify icons exist
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { Query } from "appwrite";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      // Construct Query
      const response = await databases.listDocuments(
        DATABASE_ID,
        TABLES.PACKAGES,
        [Query.orderDesc("$createdAt")]
      );
      setPackages(response.documents);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    
    try {
      await databases.deleteDocument(DATABASE_ID, TABLES.PACKAGES, id);
      // Optimistic update or refetch
      setPackages(prev => prev.filter(p => p.$id !== id));
    } catch (error) {
      console.error("Error deleting package:", error);
      alert("Failed to delete package.");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Travel Packages
        </h1>
        <Link href="/packages/create">
          <Button size="sm" className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Create New Package
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
        </div>
      ) : (
        <PackageTable packages={packages} onDelete={handleDelete} />
      )}
    </div>
  );
}
