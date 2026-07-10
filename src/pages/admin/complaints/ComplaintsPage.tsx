import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getComplaints } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  DEFAULT_PAGE_SIZE,
} from "@/constants";
import {
  Search,
  SlidersHorizontal,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComplaintCategory, ComplaintStatus, ComplaintPriority } from "@/types";

export function AdminComplaintsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const queryFilters = {
    search: search ? search : undefined,
    status: status !== "all" ? (status as ComplaintStatus) : undefined,
    category: category !== "all" ? (category as ComplaintCategory) : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminComplaints", page, queryFilters],
    queryFn: () => getComplaints(page, DEFAULT_PAGE_SIZE, queryFilters),
    placeholderData: (prev) => prev,
  });

  const complaints = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "in_progress":
        return <SlidersHorizontal className="w-4 h-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-rose-500" />;
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400";
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400";
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getCategoryLabel = (cat: string) => {
    return COMPLAINT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-8 h-8 text-violet-500" />
          Manage Complaints
        </h1>
        <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
          Review, moderate, and route citizen-filed complaints.
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/15 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search tickets by title..."
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status select */}
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {COMPLAINT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category select */}
          <Select value={category} onValueChange={(val) => { setCategory(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {COMPLAINT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load complaints database</h2>
          <p className="text-slate-500 text-sm">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold">No tickets match search</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            Try adjusting status or category filters.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Reporter</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm">
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                      {complaint.title}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-white/70">
                      {complaint.profiles?.full_name || "Citizen User"}
                    </td>
                    <td className="p-4 text-slate-500 font-medium">
                      {getCategoryLabel(complaint.category)}
                    </td>
                    <td className="p-4">
                      {complaint.priority && (
                        <Badge className={`${getPriorityClass(complaint.priority)}`}>
                          {complaint.priority}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`${getStatusColor(complaint.status)}`}>
                        <span className="flex items-center gap-1.5 capitalize">
                          {getStatusIcon(complaint.status)}
                          {complaint.status.replace("_", " ")}
                        </span>
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Link to={`/admin/complaints/${complaint.id}`}>
                        <Button variant="ghost" size="sm" className="hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-950/20 dark:hover:text-violet-400 gap-1 rounded-xl text-xs">
                          <Eye className="w-4 h-4" />
                          Moderate
                        </Button>
                      </Link>
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
            <span className="font-semibold text-slate-700 dark:text-white">{totalPages}</span> ({total} total tickets)
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
