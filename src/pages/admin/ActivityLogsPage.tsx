import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivityLogs } from "@/services/supabase";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import {
  Activity,
  Calendar,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function AdminActivityLogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminActivityLogs", page],
    queryFn: () => getActivityLogs(page, DEFAULT_PAGE_SIZE),
    placeholderData: (prev) => prev,
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
    if (action.includes("update")) return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400";
    if (action.includes("delete")) return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-8 h-8 text-violet-500" />
            System Audit Trail
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
            Browse and search logs of all administrative and citizen events recorded across the platform.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load activity logs</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold">No activity logs found</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            Platform actions will appear here once recorded.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4">Action</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Entity Reference ID</th>
                  <th className="p-4">Recorded Date & Time</th>
                  <th className="p-4 text-right">Integrity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <Badge variant="outline" className={`${getActionColor(log.action)} font-semibold py-0.5 px-2 rounded-lg text-xs capitalize`}>
                        {log.action.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-white/80 font-medium capitalize">
                      {log.entity_type.replace("_", " ")}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-xs">
                      {log.entity_id || "System event"}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded py-0.5 px-1.5 uppercase">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-6">
          <p className="text-sm text-slate-500 dark:text-white/40">
            Showing Page <span className="font-semibold text-slate-700 dark:text-white">{page}</span> of{" "}
            <span className="font-semibold text-slate-700 dark:text-white">{totalPages}</span> ({total} total logs)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-xl border-slate-200 dark:border-white/10"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-xl border-slate-200 dark:border-white/10"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
