"use client";

interface Review {
  $id: string;
  userName: string;
  packageName: string;
  rating: number;
  comment: string;
  status: string;
  $createdAt: string;
}

interface ReviewTableProps {
  reviews: Review[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
  updatingId: string | null;
}

export default function ReviewTable({
  reviews,
  onApprove,
  onReject,
  onDelete,
  updatingId,
}: ReviewTableProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`${
          i < rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
        } text-lg`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/5">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Package
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Rating
              </th>
              <th className="w-1/3 px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Comment
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
            {reviews.map((review) => (
              <tr
                key={review.$id}
                className="hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                  {review.packageName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {review.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex">{renderStars(review.rating)}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <p className="line-clamp-2">{review.comment}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      review.status === "approved"
                        ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400"
                        : review.status === "rejected"
                          ? "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400"
                    }`}
                  >
                    {review.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {review.status === "pending" && (
                      <>
                        <button
                          onClick={() => onApprove(review.$id)}
                          disabled={updatingId === review.$id}
                          className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(review.$id)}
                          disabled={updatingId === review.$id}
                          className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(review.$id)}
                      disabled={updatingId === review.$id}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
