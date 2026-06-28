"use client";

import { useQuery } from "@tanstack/react-query";

import { getAnalytics, getDashboardStats } from "@/services/analytics";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: getDashboardStats,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: getAnalytics,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
