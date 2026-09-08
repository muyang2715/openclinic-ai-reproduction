"use client";

import {
  Activity,
  CalendarCheck,
  Clock,
  Lock,
  PhoneCall,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  Users,
} from "lucide-react";

import { useAnalytics } from "@/hooks/useAnalytics";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyAppointmentsChart } from "@/components/charts/weekly-appointments-chart";
import { AppointmentStatusChart } from "@/components/charts/appointment-status-chart";
import { AppointmentsTrendChart } from "@/components/charts/appointments-trend-chart";

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

function SoonCard({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof PhoneCall;
}) {
  return (
    <Card className="border-dashed bg-background">
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-1">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <div className="flex items-center gap-1.5 text-foreground">
            <Sparkles className="size-4 text-primary" />
            <Badge variant="info">
              <Lock className="size-3" />
              即将上线
            </Badge>
          </div>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const { data, isPending, isError, refetch } = useAnalytics();

  return (
    <div className="space-y-8">
      <PageHeader
        title="运营分析"
        description="查看医院服务表现与预约趋势。"
        actions={<Badge variant="info">实时数据</Badge>}
      />

      {isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
              <TriangleAlert className="size-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                暂时无法加载分析数据
              </h3>
              <p className="text-sm text-muted-foreground">
                服务器连接异常，请稍后重试。
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              重试
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
                  label="预约总数"
                  value={data.totalAppointments}
                  icon={CalendarCheck}
                />
                <StatCard
                  label="在岗医生"
                  value={data.activeDoctors}
                  icon={Stethoscope}
                />
                <StatCard
                  label="患者总数"
                  value={data.totalPatients.toLocaleString()}
                  icon={Users}
                />
                <StatCard
                  label="平均预约时长"
                  value={`${data.averageAppointmentMinutes} min`}
                  icon={Clock}
                />
              </>
            )}
          </div>

          {/* Phase 2 (AI) metrics — placeholders */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <SoonCard label="通话总数" icon={PhoneCall} />
            <SoonCard label="智能解决率" icon={Activity} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <ChartCard title="预约趋势" className="lg:col-span-2">
              {isPending || !data ? (
                <Skeleton className="h-[260px] w-full" />
              ) : (
                <AppointmentsTrendChart data={data.appointmentsTrend} />
              )}
            </ChartCard>
            <ChartCard title="预约状态">
              {isPending || !data ? (
                <Skeleton className="h-[180px] w-full" />
              ) : (
                <AppointmentStatusChart data={data.appointmentsByStatus} />
              )}
            </ChartCard>
          </div>

          <ChartCard title="每周预约">
            {isPending || !data ? (
              <Skeleton className="h-[260px] w-full" />
            ) : (
              <WeeklyAppointmentsChart data={data.weeklyAppointments} />
            )}
          </ChartCard>
        </>
      )}
    </div>
  );
}
