"use client";
import { databaseService } from "@/lib/databaseService";
import { useState } from "react";

interface Consultation {
  $id: string;
  type: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  destination?: string;
  travelDates?: string;
  status: string;
  $createdAt: string;
}

interface ConsultationTableProps {
  consultations: Consultation[];
  onStatusChange: () => void; // Callback to refresh data
}

export default function ConsultationTable({
  consultations,
  onStatusChange,
}: ConsultationTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      await databaseService.consultations.updateStatus(id, newStatus);
      onStatusChange();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20";
      case "contacted":
        return "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20";
      case "converted":
        return "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20";
      case "closed":
        return "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20";
      default:
        return "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20";
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/5">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Service Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {consultations.map((consultation) => (
              <tr
                key={consultation.$id}
                className="hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-700/10 ring-inset dark:bg-purple-400/10 dark:text-purple-400 dark:ring-purple-400/30">
                    {consultation.type.replace("-", " ").toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {consultation.userName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {consultation.userEmail}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {consultation.userPhone}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {consultation.destination && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Dest:</span>{" "}
                      {consultation.destination}
                    </div>
                  )}
                  {consultation.travelDates && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Date:</span>{" "}
                      {consultation.travelDates}
                    </div>
                  )}
                  {/* Attachment Link */}
                  {(consultation as any).attachmentId && (
                    <div className="mt-1">
                      <a
                        href={`https://cloud.appwrite.io/v1/storage/buckets/consultation_attachments/files/${(consultation as any).attachmentId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600"
                      >
                        <span className="text-lg">📎</span>
                        {(consultation as any).attachmentName || "Attachment"}
                      </a>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {new Date(consultation.$createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(
                      consultation.status,
                    )}`}
                  >
                    {consultation.status.charAt(0).toUpperCase() +
                      consultation.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {consultation.status === "new" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(consultation.$id, "contacted")
                        }
                        disabled={updating === consultation.$id}
                        className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
                      >
                        Mark Contacted
                      </button>
                    )}
                    {/* Send Email Action */}
                    <a
                      href={`mailto:${consultation.userEmail}?subject=Re: Your Consultation Request for ${consultation.destination || "Trip Planning"}&body=Hi ${consultation.userName},\n\nWe received your request for...`}
                      className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                    >
                      Email
                    </a>
                    {consultation.status === "contacted" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(consultation.$id, "converted")
                        }
                        disabled={updating === consultation.$id}
                        className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
                      >
                        Convert
                      </button>
                    )}
                    {(consultation.status === "new" ||
                      consultation.status === "contacted") && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(consultation.$id, "closed")
                        }
                        disabled={updating === consultation.$id}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {consultations.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No consultation requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
