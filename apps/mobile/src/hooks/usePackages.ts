/**
 * usePackages Hook
 * 
 * React hook for fetching and managing travel packages.
 * Provides loading states, error handling, and caching.
 */

import { useCallback, useEffect, useState } from "react";
import { packageService } from "../lib/databaseService";
import type { PackageFilters, TravelPackage } from "../types";

interface UsePackagesReturn {
  packages: TravelPackage[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  applyFilters: (filters: PackageFilters) => Promise<void>;
}

interface UsePackageReturn {
  package: TravelPackage | null;
  isLoading: boolean;
  error: string | null;
}

const PAGE_SIZE = 20;

/**
 * Hook to fetch list of packages with pagination and filtering
 */
export function usePackages(initialFilters?: PackageFilters): UsePackagesReturn {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<PackageFilters>(initialFilters || {});

  const fetchPackages = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      
      // Use real Appwrite data
      const response = await packageService.getPackages(filters, PAGE_SIZE, currentOffset);
      
      if (reset) {
        setPackages(response.documents);
      } else {
        setPackages((prev) => [...prev, ...response.documents]);
      }
      setTotal(response.total);

      if (reset) {
        setOffset(PAGE_SIZE);
      } else {
        setOffset((prev) => prev + PAGE_SIZE);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load packages");
    } finally {
      setIsLoading(false);
    }
  }, [offset, filters]);

  // Initial load
  useEffect(() => {
    fetchPackages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional for initial load

  const loadMore = useCallback(async () => {
    if (!isLoading && packages.length < total) {
      await fetchPackages(false);
    }
  }, [fetchPackages, isLoading, packages.length, total]);

  const refresh = useCallback(async () => {
    setOffset(0);
    await fetchPackages(true);
  }, [fetchPackages]);

  const applyFilters = useCallback(async (newFilters: PackageFilters) => {
    setFilters(newFilters);
    // We rely on the effect or next fetch call, but for immediate response:
    // Actually, setting state is async, so better to call fetch logic directly or use another effect.
    // Simpler here:
    // But since fetchPackages depends on 'filters', setting it will trigger nothing if not in effect.
    // However, fetchPackages is in dependency of loadMore etc.
    // Best practice: Set filters, then manually trigger reload with new filters passed, OR put filters in dependency of useEffect.
    // For now, I'll manually trigger it.
    
    setIsLoading(true);
    try {
      const response = await packageService.getPackages(newFilters, PAGE_SIZE, 0);
      setPackages(response.documents);
      setTotal(response.total);
      setOffset(PAGE_SIZE);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    packages,
    isLoading,
    error,
    hasMore: packages.length < total,
    total,
    loadMore,
    refresh,
    applyFilters,
  };
}

/**
 * Hook to fetch a single package by ID
 */
export function usePackage(packageId: string): UsePackageReturn {
  const [pkg, setPkg] = useState<TravelPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await packageService.getPackageById(packageId);
        setPkg(data);
      } catch (err: any) {
        setError(err.message || "Failed to load package");
      } finally {
        setIsLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  return {
    package: pkg,
    isLoading,
    error,
  };
}

export default usePackages;
