import { api, type ApiEnvelope } from "@/lib/api";
import type { AnalyticsData, DashboardStats } from "@/types/analytics";

export const getDashboardStats = () =>
  api
    .get<ApiEnvelope<DashboardStats>>("/analytics/getDashboardStats")
    .then((res) => res.data.data);

export const getAnalytics = () =>
  api
    .get<ApiEnvelope<AnalyticsData>>("/analytics/getAnalytics")
    .then((res) => res.data.data);
