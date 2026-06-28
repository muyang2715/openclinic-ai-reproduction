"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CalendarClock, Lock, Pencil, Sparkles } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { useDoctor } from "@/hooks/useDoctors";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DoctorStatusBadge } from "../_components/status-badge";
import { DoctorNotFound } from "../_components/doctor-not-found";
import { WorkingHours } from "./_components/working-hours";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: doctor, isPending, isError, error } = useDoctor(id);

  const notFound =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 404;

  if (isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-44 rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (notFound || !doctor) {
    return (
      <div className="space-y-6">
        <PageHeader title="Doctor Profile" />
        <DoctorNotFound />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Profile"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/doctors">Doctors</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{doctor.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
        actions={
          <Button asChild variant="outline">
            <Link href={`/doctors/${doctor.id}/edit`}>
              <Pencil className="size-4" />
              Edit Profile
            </Link>
          </Button>
        }
      />

      {/* Header card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-brand-gradient" />
        <CardContent className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
          <Avatar className="size-24 ring-4 ring-surface">
            <AvatarFallback className="text-2xl">
              {getInitials(doctor.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-2 pb-1 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {doctor.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="brand">{doctor.speciality}</Badge>
                <span className="text-sm text-muted-foreground">
                  {doctor.department}
                </span>
              </div>
            </div>
            <DoctorStatusBadge isActive={doctor.isActive} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-5">
              <InfoRow label="Specialization" value={doctor.speciality} />
              <InfoRow label="Department" value={doctor.department} />
              <InfoRow
                label="Status"
                value={doctor.isActive ? "Active" : "Inactive"}
              />
              <InfoRow label="Joined" value={formatDate(doctor.createdAt)} />
            </CardContent>
          </Card>

          <WorkingHours doctorId={doctor.id} />

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                icon={CalendarClock}
                title="No upcoming appointments"
                description="Appointment booking arrives with the Appointments module."
                className="border-0 py-10"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Phase 2 placeholder */}
          <Card className="border-dashed bg-background">
            <CardContent className="flex flex-col items-start gap-3 pt-6">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand-gradient">
                  <Sparkles className="size-4 text-white" />
                </span>
                <span className="text-sm font-semibold text-foreground">
                  AI Assistant Assigned
                </span>
                <Badge variant="info" className="ml-1">
                  <Lock className="size-3" />
                  Soon
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Assign an AI voice receptionist to handle this doctor&apos;s
                calls, bookings, and FAQs. Coming in the next release.
              </p>
              <Button variant="outline" size="sm" disabled>
                Configure assistant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
