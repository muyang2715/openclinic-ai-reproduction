"use client";

import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  Clock,
  Stethoscope,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-react";

import { getInitials } from "@/lib/utils";
import { formatTime } from "@/lib/datetime";
import { useDashboardStats } from "@/hooks/useAnalytics";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyAppointmentsChart } from "@/components/charts/weekly-appointments-chart";
import { AppointmentStatusChart } from "@/components/charts/appointment-status-chart";
import { AppointmentsTrendChart } from "@/components/charts/appointments-trend-chart";
import { AppointmentStatusBadge } from "../appointments/_components/appointment-status-badge";

function ChartCard({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data, isPending, isError, refetch } = useDashboardStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="A quick overview of your clinic's activity."
        actions={
          <Button asChild variant="gradient">
            <Link href="/doctors/new">
              <UserPlus className="size-4" />
              Add Doctor
            </Link>
          </Button>
        }
      />

      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
              <TriangleAlert className="size-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                Couldn&apos;t load dashboard
              </h3>
              <p className="text-sm text-muted-foreground">
                There was a problem reaching the server. Please try again.
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {isPending || !data ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))
            ) : (
              <>
                <StatCard
                  label="Total Doctors"
                  value={data.totalDoctors}
                  icon={Stethoscope}
                />
                <StatCard
                  label="Total Patients"
                  value={data.totalPatients.toLocaleString()}
                  icon={Users}
                />
                <StatCard
                  label="Today's Appointments"
                  value={data.todaysAppointments}
                  icon={CalendarDays}
                />
                <StatCard
                  label="Upcoming"
                  value={data.upcomingAppointments}
                  icon={Clock}
                />
              </>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <ChartCard title="Weekly Appointments" className="lg:col-span-2">
              {isPending || !data ? (
                <Skeleton className="h-[260px] w-full" />
              ) : (
                <WeeklyAppointmentsChart data={data.weeklyAppointments} />
              )}
            </ChartCard>
            <ChartCard title="Appointment Status">
              {isPending || !data ? (
                <Skeleton className="h-[180px] w-full" />
              ) : (
                <AppointmentStatusChart data={data.appointmentsByStatus} />
              )}
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <ChartCard title="Appointments Trend" className="lg:col-span-2">
              {isPending || !data ? (
                <Skeleton className="h-[260px] w-full" />
              ) : (
                <AppointmentsTrendChart data={data.appointmentsTrend} />
              )}
            </ChartCard>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/doctors/new">
                    <UserPlus className="size-4 text-primary" />
                    Add Doctor
                  </Link>
                </Button>
                <Button asChild variant="outline" className="justify-start">
                  <Link href="/appointments">
                    <CalendarPlus className="size-4 text-primary" />
                    Book Appointment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Latest Doctors</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/doctors">View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {isPending || !data ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2.5">
                      <Skeleton className="size-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  ))
                ) : data.latestDoctors.length === 0 ? (
                  <p className="px-2 py-6 text-sm text-muted-foreground">
                    No doctors yet.
                  </p>
                ) : (
                  data.latestDoctors.map((doctor) => (
                    <Link
                      key={doctor.id}
                      href={`/doctors/${doctor.id}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-secondary"
                    >
                      <Avatar className="size-9">
                        <AvatarFallback>
                          {getInitials(doctor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {doctor.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {doctor.speciality}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Recent Appointments</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/appointments">View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {isPending || !data ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2.5">
                      <Skeleton className="size-9 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                ) : data.recentAppointments.length === 0 ? (
                  <p className="px-2 py-6 text-sm text-muted-foreground">
                    No appointments yet.
                  </p>
                ) : (
                  data.recentAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5"
                    >
                      <Avatar className="size-9">
                        <AvatarFallback>
                          {getInitials(appointment.patientName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {appointment.patientName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {appointment.doctor?.name ?? "—"}
                        </p>
                      </div>
                      <div className="ml-auto flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(appointment.startTime)}
                        </span>
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
