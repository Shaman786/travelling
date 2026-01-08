"use client";
import UserTable from "@/components/users/UserTable";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        TABLES.USERS,
        [Query.orderDesc("$createdAt")],
      );
      setUsers(response.documents);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage registered application users.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-t-brand-500 dark:border-t-brand-400 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
        </div>
      ) : (
        <UserTable users={users} />
      )}
    </div>
  );
}
