"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Stethoscope, TriangleAlert, UserPlus } from "lucide-react";

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
import { useDeleteDoctor, useDoctors } from "@/hooks/useDoctors";
import type { Doctor } from "@/types/doctor";
import { DoctorsTable } from "./_components/doctors-table";
import { DoctorsTableSkeleton } from "./_components/doctors-table-skeleton";

const PAGE_SIZE = 8;
type StatusFilter = "all" | "active" | "inactive";

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search.trim());

  // reset to first page whenever filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const query = useDoctors({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
  });
  const deleteDoctor = useDeleteDoctor();

  const { data, isPending, isError, isFetching, refetch } = query;
  const total = data?.total ?? 0;
  const items = useMemo(() => data?.items ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = debouncedSearch.length > 0 || status !== "all";

  function handleDelete(doctor: Doctor) {
    deleteDoctor.mutate(doctor.id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="医生管理"
        description="维护医院医生信息、专科与出诊安排。"
        actions={
          <Button asChild variant="gradient">
            <Link href="/doctors/new">
              <UserPlus className="size-4" />
              添加医生
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="按姓名、专科或科室搜索…"
          containerClassName="sm:max-w-sm"
        />
        <div className="sm:ml-auto">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as StatusFilter)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="active">在岗</SelectItem>
              <SelectItem value="inactive">停诊</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isPending ? (
        <DoctorsTableSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
              <TriangleAlert className="size-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                暂时无法加载医生信息
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
          icon={Stethoscope}
          title={hasFilters ? "没有找到匹配的医生" : "暂无医生信息"}
          description={
            hasFilters ? "请调整搜索条件或筛选项。" : "从添加第一位医生开始。"
          }
          action={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
              >
                清除筛选
              </Button>
            ) : (
              <Button asChild variant="gradient">
                <Link href="/doctors/new">
                  <UserPlus className="size-4" />
                  添加医生
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <div
          className={isFetching ? "opacity-70 transition-opacity" : undefined}
        >
          <DoctorsTable
            doctors={items}
            onDelete={handleDelete}
            isDeleting={deleteDoctor.isPending}
          />
          <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              显示第 {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} 位医生，共 {total} 位
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
    </div>
  );
}
