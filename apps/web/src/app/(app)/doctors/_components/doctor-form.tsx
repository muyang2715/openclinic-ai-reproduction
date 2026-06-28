"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { Doctor } from "@/types/doctor";
import { useCreateDoctor, useUpdateDoctor } from "@/hooks/useDoctors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const doctorFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  speciality: z.string().min(2, "Specialization is required"),
  department: z.string().min(2, "Department is required"),
  isActive: z.boolean(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-2 block">
        {label}
      </Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function DoctorForm({ doctor }: { doctor?: Doctor }) {
  const router = useRouter();
  const isEdit = Boolean(doctor);
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: doctor?.name ?? "",
      speciality: doctor?.speciality ?? "",
      department: doctor?.department ?? "",
      isActive: doctor?.isActive ?? true,
    },
  });

  const isSubmitting = createDoctor.isPending || updateDoctor.isPending;

  function onSubmit(values: DoctorFormValues) {
    if (isEdit && doctor) {
      updateDoctor.mutate(
        { id: doctor.id, input: values },
        { onSuccess: () => router.push(`/doctors/${doctor.id}`) },
      );
    } else {
      createDoctor.mutate(values, {
        onSuccess: (created) => router.push(`/doctors/${created.id}`),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2">
          <Field
            label="Full name"
            htmlFor="name"
            error={errors.name?.message}
            className="sm:col-span-2"
          >
            <Input
              id="name"
              placeholder="Dr. Jane Doe"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
          </Field>

          <Field
            label="Specialization"
            htmlFor="speciality"
            error={errors.speciality?.message}
          >
            <Input
              id="speciality"
              placeholder="Cardiology"
              aria-invalid={Boolean(errors.speciality)}
              {...register("speciality")}
            />
          </Field>

          <Field
            label="Department"
            htmlFor="department"
            error={errors.department?.message}
          >
            <Input
              id="department"
              placeholder="Heart & Vascular"
              aria-invalid={Boolean(errors.department)}
              {...register("department")}
            />
          </Field>

          <Field label="Status" htmlFor="status" error={errors.isActive?.message}>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Select
                  value={field.value ? "active" : "inactive"}
                  onValueChange={(value) => field.onChange(value === "active")}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/doctors")}
        >
          Cancel
        </Button>
        <Button type="submit" variant="gradient" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : isEdit
              ? "Save changes"
              : "Add doctor"}
        </Button>
      </div>
    </form>
  );
}
