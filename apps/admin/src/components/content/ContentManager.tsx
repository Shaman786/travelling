"use client";
import Button from "@/components/ui/button/Button";
import { PencilIcon, PlusIcon, TrashBinIcon } from "@/icons";
import { DATABASE_ID, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useEffect, useState } from "react";

interface ContentItem {
  $id: string;
  [key: string]: any;
}

interface ContentManagerProps {
  title: string;
  collectionId: string;
  columns: { key: string; label: string }[];
  onEdit?: (item: ContentItem) => void;
  onAdd?: () => void;
}

export default function ContentManager({
  title,
  collectionId,
  columns,
  onEdit,
  onAdd,
}: ContentManagerProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [collectionId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(DATABASE_ID, collectionId, [
        Query.orderAsc("sortOrder"),
        Query.limit(50),
      ]);
      setItems(response.documents);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, collectionId, id);
      setItems((prev) => prev.filter((item) => item.$id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item.");
    }
  };

  const toggleActive = async (item: ContentItem) => {
    try {
      await databases.updateDocument(DATABASE_ID, collectionId, item.$id, {
        isActive: !item.isActive,
      });
      setItems((prev) =>
        prev.map((i) => (i.$id === item.$id ? { ...i, isActive: !i.isActive } : i))
      );
    } catch (error) {
      console.error("Error toggling active:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          {title}
        </h1>
        {onAdd && (
          <Button size="sm" className="flex items-center gap-2" onClick={onAdd}>
            <PlusIcon className="h-5 w-5" />
            Add New
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Active
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {items.map((item) => (
                <tr key={item.$id}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white"
                    >
                      {String(item[col.key] || "-")}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.$id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <TrashBinIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
