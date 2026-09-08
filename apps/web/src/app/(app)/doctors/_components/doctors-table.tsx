"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { getInitials } from "@/lib/utils";
import type { Doctor } from "@/types/doctor";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DoctorStatusBadge } from "./status-badge";

type DoctorsTableProps = {
  doctors: Doctor[];
  onDelete: (doctor: Doctor) => void;
  isDeleting?: boolean;
};

export function DoctorsTable({
  doctors,
  onDelete,
  isDeleting,
}: DoctorsTableProps) {
  const [pendingDelete, setPendingDelete] = useState<Doctor | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>医生</TableHead>
            <TableHead>专科</TableHead>
            <TableHead>科室</TableHead>
            <TableHead>状态</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell>
                <Link
                  href={`/doctors/${doctor.id}`}
                  className="flex items-center gap-3"
                >
                  <Avatar className="size-9">
                    <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm font-medium text-foreground">
                    {doctor.name}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {doctor.speciality}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {doctor.department}
              </TableCell>
              <TableCell>
                <DoctorStatusBadge isActive={doctor.isActive} />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={`${doctor.name} 的操作`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/doctors/${doctor.id}`}>
                        <Eye className="size-4" />
                        查看
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/doctors/${doctor.id}/edit`}>
                        <Pencil className="size-4" />
                        编辑
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setPendingDelete(doctor)}
                    >
                      <Trash2 className="size-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除医生</DialogTitle>
            <DialogDescription>
              确定删除医生{" "}
              <span className="font-medium text-foreground">
                {pendingDelete?.name}
              </span>
              吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
