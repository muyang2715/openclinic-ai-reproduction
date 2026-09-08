"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus, TriangleAlert } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { useDoctors } from "@/hooks/useDoctors";
import { useAppointments, useDeleteAppointment } from "@/hooks/useAppointments";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import { AppointmentsTable } from "./_components/appointments-table";
import { AppointmentsTableSkeleton } from "./_components/appointments-table-skeleton";
import { AppointmentDialog } from "./_components/appointment-dialog";
import { APPOINTMENT_STATUSES } from "./_components/appointment-status-badge";

const PAGE_SIZE = 8;

export default function AppointmentsPage() {
  const [search, setSearch] = useState("");
  const [doctorId, setDoctorId] = useState("all");
  const [status, setStatus] = useState<AppointmentStatus | "all">("all");
  const [page, setPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const debouncedSearch = useDebounce(search.trim());

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, doctorId, status]);

  const doctorsQuery = useDoctors({ limit: 100 });
  const query = useAppointments({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    doctorId: doctorId === "all" ? undefined : doctorId,
    status: status === "all" ? undefined : status,
  });
  const deleteAppointment = useDeleteAppointment();

  const { data, isPending, isError, isFetching, refetch } = query;
  const total = data?.total ?? 0;
  const items = useMemo(() => data?.items ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const doctors = doctorsQuery.data?.items ?? [];
  const hasFilters =
    debouncedSearch.length > 0 || doctorId !== "all" || status !== "all";

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(appointment: Appointment) {
    setEditing(appointment);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="预约管理"
        description="统一安排、跟进并管理患者预约。"
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="size-4" />
            新建预约
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="按患者姓名搜索…"
          containerClassName="lg:max-w-xs"
        />
        <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="选择医生" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部医生</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value as AppointmentStatus | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="预约状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {APPOINTMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {(
                    {
                      BOOKED: "已预约",
                      CANCELLED: "已取消",
                      COMPLETED: "已完成",
                      RESCHEDULED: "已改期",
                    } as Record<string, string>
                  )[s] ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPending ? (
        <AppointmentsTableSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
              <TriangleAlert className="size-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                暂时无法加载预约
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
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={hasFilters ? "没有找到匹配的预约" : "暂无预约"}
          description={
            hasFilters ? "请调整搜索条件或筛选项。" : "从创建第一条预约开始。"
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setDoctorId("all");
                  setStatus("all");
                }}
              >
                清除筛选
              </Button>
            ) : (
              <Button variant="gradient" onClick={openCreate}>
                <Plus className="size-4" />
                新建预约
              </Button>
            )
          }
        />
      ) : (
        <div
          className={isFetching ? "opacity-70 transition-opacity" : undefined}
        >
          <AppointmentsTable
            appointments={items}
            onEdit={openEdit}
            onDelete={(appointment) => deleteAppointment.mutate(appointment.id)}
            isDeleting={deleteAppointment.isPending}
          />
          <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              显示第 {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} 条，共 {total} 条预约
            </p>
            {totalPages > 1 && (
              <Pagination className="mx-0 w-auto justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}

      <AppointmentDialog
        appointment={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
