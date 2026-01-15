"use client";

import { Addon, databaseService } from "@/lib/databaseService";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const data = await databaseService.addons.list();
      setAddons(data);
    } catch (error) {
      console.error("Failed to fetch add-ons", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this add-on?")) {
      try {
        await databaseService.addons.delete(id);
        fetchAddons(); // Refresh list
      } catch (error) {
        alert("Failed to delete add-on");
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Add-ons
        </h1>
        <Link
          href="/addons/create"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add New Add-on
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : addons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No add-ons found.
                  </td>
                </tr>
              ) : (
                addons.map((addon) => (
                  <tr
                    key={addon.$id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{addon.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">${addon.price}</td>
                    <td className="px-6 py-4 capitalize">
                      {addon.type.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(addon.$id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
