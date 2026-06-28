import { Request, Response } from "express";
import * as analyticsData from "../data/analytics.data";
import { bucketByDay, bucketByMonth, averageMinutes } from "../helpers/analytics";
import { sendSuccess, sendError } from "../helpers/apiResponse";

type StatusGroup = { status: string; _count: number };

function toStatusCounts(groups: StatusGroup[]) {
  return groups.map((g) => ({ status: g.status, count: g._count }));
}

function dayWindow() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

// getDashboardStats
export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const { start, end } = dayWindow();
    const weekAgo = new Date(start);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalDoctors,
      totalPatients,
      todaysAppointments,
      upcomingAppointments,
      statusGroups,
      recentAppointments,
      latestDoctors,
      weekRows,
      monthRows,
    ] = await Promise.all([
      analyticsData.countTotalDoctors(),
      analyticsData.countDistinctPatients(),
      analyticsData.countAppointmentsBetween(start, end),
      analyticsData.countUpcomingAppointments(now),
      analyticsData.groupAppointmentsByStatus(),
      analyticsData.findRecentAppointments(5),
      analyticsData.findLatestDoctors(5),
      analyticsData.findAppointmentTimesSince(weekAgo),
      analyticsData.findAppointmentTimesSince(sixMonthsAgo),
    ]);

    return sendSuccess(res, 200, "Dashboard stats fetched successfully", {
      totalDoctors,
      totalPatients,
      todaysAppointments,
      upcomingAppointments,
      weeklyAppointments: bucketByDay(weekRows, 7),
      appointmentsTrend: bucketByMonth(monthRows, 6),
      appointmentsByStatus: toStatusCounts(statusGroups),
      recentAppointments,
      latestDoctors,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// getAnalytics
export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const { start } = dayWindow();
    const weekAgo = new Date(start);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalAppointments,
      activeDoctors,
      totalDoctors,
      totalPatients,
      statusGroups,
      allTimes,
      weekRows,
      monthRows,
    ] = await Promise.all([
      analyticsData.countTotalAppointments(),
      analyticsData.countActiveDoctors(),
      analyticsData.countTotalDoctors(),
      analyticsData.countDistinctPatients(),
      analyticsData.groupAppointmentsByStatus(),
      analyticsData.findAllAppointmentTimes(),
      analyticsData.findAppointmentTimesSince(weekAgo),
      analyticsData.findAppointmentTimesSince(sixMonthsAgo),
    ]);

    return sendSuccess(res, 200, "Analytics fetched successfully", {
      totalAppointments,
      activeDoctors,
      totalDoctors,
      totalPatients,
      averageAppointmentMinutes: averageMinutes(allTimes),
      appointmentsByStatus: toStatusCounts(statusGroups),
      appointmentsTrend: bucketByMonth(monthRows, 6),
      weeklyAppointments: bucketByDay(weekRows, 7),
    });
  } catch (error) {
    return sendError(res, error);
  }
};
