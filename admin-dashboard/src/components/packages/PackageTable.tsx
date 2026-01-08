"use client";
import { PencilIcon, TrashBinIcon } from "@/icons";
import NextImage from "next/image";
import Link from "next/link";
// Assuming icons exist, otherwise we'll standard SVG or check icons folder

interface Package {
  $id: string;
  title: string;
  price: number;
  destination: string;
  isActive: boolean;
  imageUrl?: string;
}

interface PackageTableProps {
  packages: Package[];
  onDelete?: (id: string) => void;
}

export default function PackageTable({
  packages,
  onDelete,
}: PackageTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/5">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Package Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Destination
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Price
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
            {packages.map((pkg) => (
              <tr
                key={pkg.$id}
                className="hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {/* Placeholder for image */}
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {pkg.imageUrl ? (
                        <NextImage
                          src={pkg.imageUrl}
                          alt={pkg.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          Img
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {pkg.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                  {pkg.destination}
                </td>
                <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-800 dark:text-white/90">
                  ${pkg.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      pkg.isActive
                        ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
                        : "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"
                    }`}
                  >
                    {pkg.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/packages/${pkg.$id}/edit`}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => onDelete && onDelete(pkg.$id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-400/10"
                    >
                      <TrashBinIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No packages found. Click &quot;Create New&quot; to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
