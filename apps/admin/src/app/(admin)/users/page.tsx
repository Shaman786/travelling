"use client";
import CreateUserModal from "@/components/users/CreateUserModal";
import UserTable from "@/components/users/UserTable";
import Pagination from "@/components/common/Pagination";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useCallback, useEffect, useState } from "react";
import { SearchIcon } from "@/icons";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search & Pagination States
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queries = [
        Query.orderDesc("$createdAt"),
        Query.limit(PAGE_SIZE),
        Query.offset((page - 1) * PAGE_SIZE),
      ];

      if (search) {
        queries.push(Query.search("name", search));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        TABLES.USERS,
        queries,
      );
      setUsers(response.documents);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Users
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage registered application users.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="focus:border-brand-500 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 text-sm focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <div className="absolute top-2.5 left-3 text-gray-400">
              <SearchIcon className="h-5 w-5" />
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-500 hover:bg-brand-600 hover:shadow-brand-500/25 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-lg transition"
          >
            + Add User
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-t-brand-500 dark:border-t-brand-400 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-800"></div>
        </div>
      ) : (
        <>
          <UserTable users={users} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
