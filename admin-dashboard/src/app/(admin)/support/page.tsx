"use client";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Support & Help
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Need assistance? We&apos;re here to help you manage your dashboard.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Contact Support */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="bg-brand-50 dark:bg-brand-500/10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-3xl">
            📨
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
            Contact Developer
          </h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Facing a technical issue or have a feature request? Reach out
            directly.
          </p>
          <a
            href="mailto:support@travelling.com"
            className="bg-brand-500 hover:bg-brand-600 hover:shadow-brand-500/25 inline-flex items-center justify-center rounded-xl px-6 py-3 font-medium text-white transition hover:shadow-lg"
          >
            Email Support
          </a>
        </div>

        {/* Documentation */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl dark:bg-blue-500/10">
            📚
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
            Documentation
          </h2>
          <p className="mb-6 text-gray-500 dark:text-gray-400">
            Learn how to manage packages, bookings, and users efficiently.
          </p>
          <button
            className="inline-flex items-center justify-center rounded-xl border-2 border-gray-200 px-6 py-3 font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            onClick={() => alert("Documentation coming soon!")}
          >
            View Guides
          </button>
        </div>
      </div>

      {/* FAQs */}
      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8 shadow-xs dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-6 text-xl font-bold text-gray-800 dark:text-white">
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          <details className="group rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-800 dark:text-white">
              <span>How do I add a new admin user?</span>
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-4 text-gray-600 dark:text-gray-400">
              Currently, admin users must be added directly via the database
              console or by an existing admin updating a user&apos;s role in the
              Users section.
            </div>
          </details>
          <details className="group rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-800 dark:text-white">
              <span>Where can I view payment details?</span>
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-4 text-gray-600 dark:text-gray-400">
              Navigate to the &quot;Payments&quot; tab in the sidebar to view
              all transaction history and status updates.
            </div>
          </details>
          <details className="group rounded-xl bg-gray-50 p-4 dark:bg-white/5">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-gray-800 dark:text-white">
              <span>Can I delete a booking?</span>
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <div className="mt-4 text-gray-600 dark:text-gray-400">
              Yes, you can manage bookings from the &quot;Bookings&quot; page.
              However, we recommend cancelling instead of deleting to maintain
              records.
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
