"use client";
import { TrashBinIcon } from "@/icons";
import { DATABASE_ID, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useCallback, useEffect, useState } from "react";

interface WizardOption {
  $id: string;
  wizardId: string;
  optionKey: string;
  label: string;
  value: string;
  icon?: string;
  extra?: string;
  sortOrder: number;
  isActive: boolean;
}

const WIZARD_CONFIGS = [
  { id: "trip_wizard", name: "Trip Wizard", keys: ["interests", "budget_tiers"] },
  { id: "visa_checker", name: "Visa Checker", keys: ["destinations", "citizenships"] },
  { id: "deal_hunter", name: "Deal Hunter", keys: ["cabin_class"] },
  { id: "vibe_finder", name: "Vibe Finder", keys: ["vibes"] },
  { id: "group_planner", name: "Group Planner", keys: ["trip_types"] },
  { id: "insurance_calc", name: "Insurance Calculator", keys: ["coverage_types"] },
  { id: "concierge", name: "Concierge Connect", keys: ["service_types"] },
  { id: "marketplace", name: "Service Marketplace", keys: ["categories"] },
];

export default function WizardOptionsPage() {
  const [options, setOptions] = useState<WizardOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWizard, setSelectedWizard] = useState("trip_wizard");
  const [selectedKey, setSelectedKey] = useState("interests");

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(DATABASE_ID, "wizard_options", [
        Query.equal("wizardId", selectedWizard),
        Query.equal("optionKey", selectedKey),
        Query.orderAsc("sortOrder"),
        Query.limit(50),
      ]);
      setOptions(response.documents as unknown as WizardOption[]);
    } catch (error) {
      console.error("Error fetching wizard options:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedWizard, selectedKey]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this option?")) return;
    try {
      await databases.deleteDocument(DATABASE_ID, "wizard_options", id);
      setOptions((prev) => prev.filter((opt) => opt.$id !== id));
    } catch (error) {
      console.error("Error deleting option:", error);
      alert("Failed to delete option.");
    }
  };

  const toggleActive = async (opt: WizardOption) => {
    try {
      await databases.updateDocument(DATABASE_ID, "wizard_options", opt.$id, {
        isActive: !opt.isActive,
      });
      setOptions((prev) =>
        prev.map((o) => (o.$id === opt.$id ? { ...o, isActive: !o.isActive } : o))
      );
    } catch (error) {
      console.error("Error toggling active:", error);
    }
  };

  const currentWizard = WIZARD_CONFIGS.find((w) => w.id === selectedWizard);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Wizard Options
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configure options for mobile app wizards and forms
        </p>
      </div>

      {/* Wizard Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {WIZARD_CONFIGS.map((wizard) => (
          <button
            key={wizard.id}
            onClick={() => {
              setSelectedWizard(wizard.id);
              setSelectedKey(wizard.keys[0]);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedWizard === wizard.id
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {wizard.name}
          </button>
        ))}
      </div>

      {/* Option Key Selector */}
      {currentWizard && (
        <div className="mb-6 flex gap-2">
          {currentWizard.keys.map((key) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`rounded-md px-3 py-1 text-sm ${
                selectedKey === key
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {key.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      )}

      {/* Options Table */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Label
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Icon
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Active
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {options.map((opt) => (
                <tr key={opt.$id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {opt.label}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {opt.value}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {opt.icon || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {opt.sortOrder}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <button
                      onClick={() => toggleActive(opt)}
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        opt.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {opt.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => handleDelete(opt.$id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      <TrashBinIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {options.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No options found for this wizard/key combination.
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
