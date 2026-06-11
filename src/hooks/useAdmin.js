import { useState, useEffect, useCallback } from 'react';
import * as adminService from '@/services/adminService';

function useAdminDataFetcher(fetcherFn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherFn();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetcherFn]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, setData, loading, error, refetch: fetch };
}

export function useAdminProducts() {
  return useAdminDataFetcher(adminService.getAllProductsAdmin);
}

export function useAdminOrders() {
  return useAdminDataFetcher(adminService.getAllOrdersAdmin);
}

export function useAdminCategories() {
  return useAdminDataFetcher(adminService.getAllCategoriesAdmin);
}

export function useAdminBanners() {
  return useAdminDataFetcher(adminService.getAllBannersAdmin);
}

export function useAdminCoupons() {
  return useAdminDataFetcher(adminService.getAllCouponsAdmin);
}

export function useAdminDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStatsAdmin();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { stats, loading, refetch: fetch };
}
