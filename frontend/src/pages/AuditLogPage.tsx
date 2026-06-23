import { useState, useEffect, useCallback } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface AuditLog {
    id: number;
    action: string;
    performedBy: string;
    detail: string;
    timestamp: string;
}

interface SpringPage<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
}

const ACTION_STYLES: Record<string, string> = {
    CREATE_STUDENT: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    UPDATE_STUDENT: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    DELETE_STUDENT: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    IMPORT_STUDENTS: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    PROMOTE_STUDENTS: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    CREATE_USER: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    UPDATE_USER: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    DELETE_USER: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function formatTimestamp(ts: string) {
    return new Date(ts).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

const PAGE_SIZE = 50;

export default function AuditLogPage() {
    const [page, setPage] = useState(0);
    const [data, setData] = useState<SpringPage<AuditLog> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const fetchLogs = useCallback(async (p: number) => {
        setIsLoading(true);
        setIsError(false);
        try {
            const res = await api.get<SpringPage<AuditLog>>(`/audit?page=${p}&size=${PAGE_SIZE}`);
            setData(res.data);
        } catch {
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchLogs(page); }, [fetchLogs, page]);

    const logs = data?.content ?? [];
    const totalPages = data?.totalPages ?? 0;
    const totalElements = data?.totalElements ?? 0;

    return (
        <PageContainer
            title="Audit Log"
            description="System activity trail — all create, update, delete, and import actions"
            actions={
                <Button variant="outline" size="sm" onClick={() => fetchLogs(page)} disabled={isLoading}>
                    <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                    Refresh
                </Button>
            }
        >
            <div className="rounded-lg border bg-card shadow-sm">
                {isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                        <AlertCircle className="h-8 w-8" />
                        <p>Failed to load audit logs.</p>
                        <Button variant="outline" size="sm" onClick={() => fetchLogs(page)}>Retry</Button>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left">
                                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground w-44">Timestamp</th>
                                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground w-40">Action</th>
                                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">Performed By</th>
                                        <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Detail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading
                                        ? Array.from({ length: 10 }).map((_, i) => (
                                              <tr key={i} className="border-b">
                                                  <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                                                  <td className="px-4 py-3"><Skeleton className="h-5 w-28 rounded-full" /></td>
                                                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                                                  <td className="px-4 py-3"><Skeleton className="h-4 w-64" /></td>
                                              </tr>
                                          ))
                                        : logs.map((log) => (
                                              <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                                                      {formatTimestamp(log.timestamp)}
                                                  </td>
                                                  <td className="px-4 py-3">
                                                      <span className={cn(
                                                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
                                                          ACTION_STYLES[log.action] ?? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                                      )}>
                                                          {log.action.replace(/_/g, " ")}
                                                      </span>
                                                  </td>
                                                  <td className="px-4 py-3 font-medium">{log.performedBy}</td>
                                                  <td className="px-4 py-3 text-muted-foreground">{log.detail}</td>
                                              </tr>
                                          ))}
                                </tbody>
                            </table>
                        </div>

                        {!isLoading && totalPages > 1 && (
                            <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                                <span>
                                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)} of {totalElements}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="tabular-nums">Page {page + 1} of {totalPages}</span>
                                    <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!isLoading && logs.length === 0 && (
                            <div className="py-16 text-center text-sm text-muted-foreground">
                                No audit log entries yet.
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageContainer>
    );
}
