"use client";

import { useParams } from "next/navigation";

import { useDoctor } from "@/hooks/useDoctors";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DoctorForm } from "../../_components/doctor-form";
import { DoctorNotFound } from "../../_components/doctor-not-found";

export default function EditDoctorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: doctor, isPending, isError, error } = useDoctor(id);

  const notFound =
    isError &&
    (error as { response?: { status?: number } })?.response?.status === 404;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit Doctor"
        description={doctor ? `Update ${doctor.name}'s profile.` : " "}
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/doctors">Doctors</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/doctors/${id}`}>
                  {doctor?.name ?? "Doctor"}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />

      {isPending ? (
        <Card>
          <CardContent className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2">
            <Skeleton className="h-16 sm:col-span-2" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </CardContent>
        </Card>
      ) : notFound || !doctor ? (
        <DoctorNotFound />
      ) : (
        <DoctorForm doctor={doctor} />
      )}
    </div>
  );
}
