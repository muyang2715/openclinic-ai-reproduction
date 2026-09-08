"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, TriangleAlert } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
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
import { useDeleteDocument, useDocuments } from "@/hooks/useKnowledgeBase";
import type { KbDocument } from "@/types/knowledgeBase";
import { UploadCard } from "./_components/upload-card";
import { DocumentsTable } from "./_components/documents-table";
import { DocumentsTableSkeleton } from "./_components/documents-table-skeleton";

const PAGE_SIZE = 8;

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search.trim());

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const query = useDocuments({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });
  const deleteDocument = useDeleteDocument();

  const { data, isPending, isError, isFetching, refetch } = query;
  const total = data?.total ?? 0;
  const items = useMemo(() => data?.items ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = debouncedSearch.length > 0;

  function handleDelete(document: KbDocument) {
    deleteDocument.mutate(document.id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="医疗知识库"
        description="上传院内文档，为智能前台提供可靠的回答依据。"
        actions={<Badge variant="info">RAG</Badge>}
      />

      <UploadCard />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="按文档名称搜索…"
          containerClassName="sm:max-w-sm"
        />
      </div>

      {isPending ? (
        <DocumentsTableSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
              <TriangleAlert className="size-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                暂时无法加载文档
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
          icon={BookOpen}
          title={hasFilters ? "没有找到匹配的文档" : "暂无知识库文档"}
          description={
            hasFilters
              ? "请尝试其他搜索条件。"
              : "上传第一份文档，开始构建医院知识库。"
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
          <DocumentsTable
            documents={items}
            onDelete={handleDelete}
            isDeleting={deleteDocument.isPending}
          />
          <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              显示第 {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} 份，共 {total} 份文档
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
