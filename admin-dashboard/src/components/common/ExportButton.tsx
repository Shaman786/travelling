"use client";
import { DownloadIcon } from "@/icons"; // Ensure DownloadIcon exists or use placeholder

interface ExportButtonProps {
  data: any[];
  filename?: string;
  columns?: string[]; // Optional: specifiy columns to export
}

export default function ExportButton({
  data,
  filename = "export",
  columns,
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = columns || Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const value = row[fieldName];
            // Handle commas and quotes in data
            const stringValue = String(
              value === undefined || value === null ? "" : value,
            );
            return `"${stringValue.replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `${filename}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      <DownloadIcon className="h-4 w-4" />
      Export CSV
    </button>
  );
}
