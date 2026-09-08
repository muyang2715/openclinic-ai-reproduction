"use client";

import { useEffect, useMemo, useState } from "react";
import { PhoneCall, TriangleAlert } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useDebounce } from "@/hooks/use-debounce";
import { useCallsList } from "@/hooks/useCalls";
import type { CallSummary } from "@/types/call";
import { CallsTable } from "./_components/calls-table";
import { CallDetailDialog } from "./_components/call-detail-dialog";

const PAGE_SIZE = 8;

export default function CallsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CallSummary | null>(null);

  const debouncedSearch = useDebounce(search.trim());

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isPending, isError, isFetching, refetch } = useCallsList({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const total = data?.total ?? 0;
  const items = useMemo(() => data?.items ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = debouncedSearch.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="通话记录"
        description="查看患者来电、转写内容与服务记录。"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="按来电姓名搜索…"
          containerClassName="sm:max-w-sm"
        />
      </div>

      {isPending ? (
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            正在加载通话记录…
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
              <TriangleAlert className="size-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                暂时无法加载通话记录
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
          icon={PhoneCall}
          title={hasFilters ? "没有找到匹配的通话" : "暂无通话记录"}
          description={
            hasFilters
              ? "请尝试其他搜索条件。"
              : "完成的语音通话及其转写会显示在这里。"
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={() => setSearch("")}>
                清除搜索
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={isFetching ? "opacity-70 transition-opacity" : undefined}
        >
          <CallsTable calls={items} onSelect={setSelected} />
          <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              显示第 {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} 条，共 {total} 条通话
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

      <CallDetailDialog call={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
