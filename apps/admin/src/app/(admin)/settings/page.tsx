"use client";
import { DATABASE_ID, databases, TABLES } from "@/lib/appwrite";
import { useEffect, useState } from "react";

// We use a fixed ID for the global configuration document
const GLOBAL_CONFIG_ID = "global_config";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Config State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [bookingFee, setBookingFee] = useState("5");
  const [currency, setCurrency] = useState("USD");
  const [supportEmail, setSupportEmail] = useState("support@host-palace.app");

  // Integrations State
  const [dbConnected, setDbConnected] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      try {
        const doc = await databases.getDocument(
          DATABASE_ID,
          TABLES.SYSTEM_CONFIG,
          GLOBAL_CONFIG_ID,
        );
        setBookingFee(doc.bookingFee?.toString() || "0");
        setCurrency(doc.currency || "USD");
        setSupportEmail(doc.supportEmail || "");
        setMaintenanceMode(doc.maintenanceMode || false);
        setDbConnected(true);
      } catch (e: any) {
        if (e.code === 404) {
          // Config doesn't exist yet, we will create on save.
          setDbConnected(true); // Connectivity is fine, just no doc.
        } else {
          console.error("Failed to fetch config", e);
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        bookingFee: parseFloat(bookingFee) || 0,
        currency,
        supportEmail,
        maintenanceMode,
      };

      try {
        await databases.updateDocument(
          DATABASE_ID,
          TABLES.SYSTEM_CONFIG,
          GLOBAL_CONFIG_ID,
          payload,
        );
      } catch (e: any) {
        if (e.code === 404) {
          await databases.createDocument(
            DATABASE_ID,
            TABLES.SYSTEM_CONFIG,
            GLOBAL_CONFIG_ID,
            payload,
          );
        } else {
          throw e;
        }
      }

      alert("System configuration updated successfully!");
    } catch (error: any) {
      console.error("Save failed:", error);
      alert("Failed to save settings: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading system config...
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          System Settings
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Configure global platform parameters and integrations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Platform Configuration */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
            <span className="text-xl">⚙️</span> Platform Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Global Booking Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bookingFee}
                  onChange={(e) => setBookingFee(e.target.value)}
                  className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:outline-hidden dark:border-gray-700 dark:text-white"
                />
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400">
                  %
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Applied to all new bookings.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:outline-hidden dark:border-gray-700 dark:text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="BDT">BDT (৳)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Support Contact Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="focus:border-brand-500 focus:ring-brand-500 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-gray-800 focus:outline-hidden dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* System Status & Integrations */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
              <span className="text-xl">🚦</span> System Status
            </h2>

            <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-white/5">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  Maintenance Mode
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Disable user access for updates.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-red-500 peer-focus:outline-hidden after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700"></div>
              </label>
            </div>
            {maintenanceMode && (
              <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
                ⚠️ Warning: The app is currently in maintenance mode. Users
                cannot make bookings.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white">
              <span className="text-xl">🔗</span> Integrations Health
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${dbConnected ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50"} shadow-sm`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Appwrite Database
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${dbConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                >
                  {dbConnected ? "Connected" : "Offline"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Storage Buckets
                  </span>
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Airwallex Payments
                  </span>
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-4 border-t border-gray-200 pt-6 dark:border-gray-800">
        <button className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-500 hover:bg-brand-600 hover:shadow-brand-500/25 rounded-xl px-8 py-2.5 text-sm font-medium text-white shadow-lg transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </div>
    </div>
  );
}
