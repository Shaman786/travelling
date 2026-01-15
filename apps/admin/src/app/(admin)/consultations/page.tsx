"use client";
import ExportButton from "@/components/common/ExportButton";
import SearchInput from "@/components/common/SearchInput";
import ConsultationTable from "@/components/consultations/ConsultationTable";
import { databaseService } from "@/lib/databaseService";
import { useCallback, useEffect, useState } from "react";

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await databaseService.consultations.list(100, statusFilter);
      setConsultations(docs);
    } catch (error) {
      console.error("Error fetching consultations:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const filteredConsultations = consultations.filter((consultation) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      consultation.userName.toLowerCase().includes(searchLower) ||
      consultation.userEmail.toLowerCase().includes(searchLower) ||
      consultation.type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Consultations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage travel consultation requests and leads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            onSearch={setSearch}
            placeholder="Search consultations..."
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-purple-500 focus:outline-none dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
          <ExportButton data={filteredConsultations} filename="consultations" />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-500 dark:border-gray-800 dark:border-t-purple-400"></div>
        </div>
      ) : (
        <ConsultationTable
          consultations={filteredConsultations}
          onStatusChange={fetchConsultations}
        />
      )}
    </div>
  );
}
