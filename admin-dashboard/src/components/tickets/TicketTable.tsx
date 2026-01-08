"use client";
import { EyeIcon } from "@/icons";
import { format } from "date-fns";
import Link from "next/link";

interface Ticket {
  $id: string;
  userName: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  $createdAt: string;
}

interface TicketTableProps {
  tickets: Ticket[];
}

export default function TicketTable({ tickets }: TicketTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/5">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Subject
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {tickets.map((ticket) => (
              <tr
                key={ticket.$id}
                className="hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                  {ticket.subject}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {ticket.userName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 capitalize dark:text-gray-400">
                  {ticket.category.replace("_", " ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      ticket.priority === "urgent"
                        ? "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400"
                        : ticket.priority === "high"
                          ? "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-400"
                          : "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400"
                    }`}
                  >
                    {ticket.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      ticket.status === "closed"
                        ? "bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400"
                        : ticket.status === "resolved"
                          ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400"
                          : "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400"
                    }`}
                  >
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(ticket.$createdAt), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                  <Link
                    href={`/tickets/${ticket.$id}`}
                    className="hover:text-brand-500 dark:hover:text-brand-400 flex items-center justify-end gap-2 text-gray-500 dark:text-gray-400"
                  >
                    <EyeIcon /> View
                  </Link>
                </td>
              </tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
