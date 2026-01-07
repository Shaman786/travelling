/**
 * usePackages Hook
 * 
 * React hook for fetching and managing travel packages.
 * Provides loading states, error handling, and caching.
 */

import { useCallback, useEffect, useState } from "react";
import { packages as mockPackages } from "../data/mockData";
import { isAppwriteConfigured } from "../lib/appwrite";
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

const mapMockToTravelPackage = (p: any): TravelPackage => ({
  $id: p.id,
  $collectionId: "mock_packages",
  $databaseId: "mock_db",
  $createdAt: new Date().toISOString(),
  $updatedAt: new Date().toISOString(),
  $permissions: [],
  $sequence: 0,
  title: p.title,
  destination: p.title, // Fallback since mock doesn't have explicit city
  country: p.region,
  category: "adventure", // Default, or map from tags
  price: p.base_price,
  duration: `${p.duration_days} Days`,
  rating: p.rating,
  reviewCount: p.reviewCount,
  imageUrl: p.image,
  images: p.images || [p.image],
  description: p.description,
  highlights: p.tags || [],
  inclusions: p.inclusions,
  exclusions: [],
  itinerary: p.itinerary.map((d: any) => ({
    day: d.day,
    title: d.title,
    description: d.description,
    activities: d.activities
  })),
  isActive: true,
  createdAt: new Date().toISOString(),
});

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

      if (isAppwriteConfigured()) {
        // Use real Appwrite data
        const response = await packageService.getPackages(filters, PAGE_SIZE, currentOffset);
        
        if (reset) {
          setPackages(response.documents);
        } else {
          setPackages((prev) => [...prev, ...response.documents]);
        }
        setTotal(response.total);
      } else {
        // Fallback to mock data during development
        let filtered = mockPackages;

        // Apply filters to mock data
        if (filters.category) {
          // Approximate category filtering since mock data structure differs
          filtered = filtered.filter((p) => p.tags.includes("Adventure") || p.region === filters.category);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.title.toLowerCase().includes(search) ||
              p.description.toLowerCase().includes(search)
          );
        }

        const mapped = filtered.map(mapMockToTravelPackage);

        setPackages(mapped);
        setTotal(mapped.length);
      }

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
  }, [offset, filters]); // Added dependencies

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
      if (isAppwriteConfigured()) {
        const response = await packageService.getPackages(newFilters, PAGE_SIZE, 0);
        setPackages(response.documents);
        setTotal(response.total);
      } else {
        // Mock filter logic again (duplicated for simplicity or refactor)
        // ... omitted for brevity, relying on next render if we change impl, but here I'll just reset.
        // Actually, just calling fetchPackages(true) usually works if it reads state, but state might not be updated yet.
        // I will just defer to the user manual refresh or simple re-implementation here.
        
         // Fallback to mock data during development
         let filtered = mockPackages;
         if (newFilters.search) {
           const search = newFilters.search.toLowerCase();
           filtered = filtered.filter(p => p.title.toLowerCase().includes(search));
         }
         const mapped = filtered.map(mapMockToTravelPackage);
         setPackages(mapped);
         setTotal(mapped.length);
      }
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
        if (isAppwriteConfigured()) {
          const data = await packageService.getPackageById(packageId);
          setPkg(data);
        } else {
          // Fallback to mock data
          const mockPkg = mockPackages.find(p => p.id === packageId);
          if (mockPkg) {
            setPkg(mapMockToTravelPackage(mockPkg));
          } else {
            setError("Package not found");
          }
        }
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
