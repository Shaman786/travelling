import { useEffect, useState } from "react";
import databaseService from "../lib/databaseService";
import type { Banner } from "../types";

export const useBanners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await databaseService.banners.getBanners();
      setBanners(data);
    } catch (error) {
      console.error("Failed to fetch banners", error);
    } finally {
      setLoading(false);
    }
  };

  return { banners, loading, refresh: fetchBanners };
};
