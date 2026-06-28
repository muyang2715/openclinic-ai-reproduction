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
import {
  useAppointments,
  useDeleteAppointment,
} from "@/hooks/useAppointments";
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
        title="Appointments"
        description="Schedule, track, and manage patient appointments."
        actions={
          <Button variant="gradient" onClick={openCreate}>
            <Plus className="size-4" />
            New Appointment
          </Button>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search by patient name..."
          containerClassName="lg:max-w-xs"
        />
        <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All doctors</SelectItem>
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
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {APPOINTMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
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
                Couldn&apos;t load appointments
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
      ) : items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={hasFilters ? "No appointments found" : "No appointments yet"}
          description={
            hasFilters
              ? "Try adjusting your search or filters."
              : "Get started by booking your first appointment."
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
                Clear filters
              </Button>
            ) : (
              <Button variant="gradient" onClick={openCreate}>
                <Plus className="size-4" />
                New Appointment
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
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total} appointments
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
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
