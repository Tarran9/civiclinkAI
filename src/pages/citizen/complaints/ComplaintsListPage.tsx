import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getComplaints } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  DEFAULT_PAGE_SIZE,
} from "@/constants";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Grid,
  List,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
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
import type { ComplaintCategory, ComplaintStatus, ComplaintWithProfile } from "@/types";

export function ComplaintsListPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const queryFilters = {
    userId: user?.id,
    search: search ? search : undefined,
    status: status !== "all" ? (status as ComplaintStatus) : undefined,
    category: category !== "all" ? (category as ComplaintCategory) : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["complaints", "list", page, queryFilters],
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
        return <SlidersHorizontal className="w-4 h-4 text-blue-500 animate-pulse" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadgeClass = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
      case "rejected":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-900/50";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
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

  const getCategoryLabel = (cat: ComplaintCategory) => {
    return COMPLAINT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">
            My Complaints
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
            Submit, view, and track resolutions of your civic issues.
          </p>
        </div>
        <Link to={ROUTES.CITIZEN.COMPLAINT_NEW}>
          <Button className="bg-gradient-to-r from-civic-600 to-civic-500 hover:from-civic-700 hover:to-civic-600 text-white rounded-xl shadow-lg shadow-civic-500/20 gap-2">
            <Plus className="w-4 h-4" />
            File a Complaint
          </Button>
        </Link>
      </div>

      {/* Filter and search controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/15 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search complaints..."
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap w-full md:w-auto items-center gap-3">
          {/* Status filter */}
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
          >
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

          {/* Category filter */}
          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
          >
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

          {/* View toggle */}
          <div className="flex border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden self-stretch sm:self-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className={`rounded-none px-3.5 ${
                viewMode === "grid" ? "bg-civic-500 hover:bg-civic-600 text-white" : ""
              }`}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className={`rounded-none px-3.5 ${
                viewMode === "list" ? "bg-civic-500 hover:bg-civic-600 text-white" : ""
              }`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Failed to load complaints</h2>
          <p className="text-slate-500 dark:text-white/60 text-sm max-w-md mx-auto">
            {error instanceof Error ? error.message : "Something went wrong while pulling your complaints."}
          </p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">No complaints found</h2>
          <p className="text-slate-500 dark:text-white/60 text-sm max-w-sm mx-auto">
            You haven't filed any complaints matching the selected filters yet.
          </p>
          <Link to={ROUTES.CITIZEN.COMPLAINT_NEW}>
            <Button className="mt-2 bg-civic-500 hover:bg-civic-600 text-white rounded-xl">
              File Your First Complaint
            </Button>
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className={`${getStatusBadgeClass(complaint.status)}`}>
                    <span className="flex items-center gap-1.5 capitalize">
                      {getStatusIcon(complaint.status)}
                      {complaint.status.replace("_", " ")}
                    </span>
                  </Badge>
                  {complaint.priority && (
                    <Badge className={`${getPriorityBadgeClass(complaint.priority)}`}>
                      {complaint.priority}
                    </Badge>
                  )}
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg line-clamp-1 mb-2 group-hover:text-civic-600 dark:group-hover:text-civic-400 transition-colors">
                  {complaint.title}
                </h3>
                <p className="text-slate-500 dark:text-white/60 text-sm line-clamp-3 mb-4 leading-relaxed">
                  {complaint.description}
                </p>
              </div>

              <div className="border-t border-slate-50 dark:border-white/5 pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-white/30">
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {getCategoryLabel(complaint.category)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2 mt-2">
                  <span className="text-xs text-slate-400 dark:text-white/40 truncate max-w-[150px]">
                    Location: {complaint.location || "Not specified"}
                  </span>
                  <Link to={`/citizen/complaints/${complaint.id}`}>
                    <Button variant="ghost" size="sm" className="hover:bg-civic-50 hover:text-civic-600 dark:hover:bg-civic-950/30 dark:hover:text-civic-400 gap-1.5">
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-slate-400 dark:text-white/40">
                    {getCategoryLabel(complaint.category)}
                  </span>
                  <span className="text-slate-300 dark:text-white/10">•</span>
                  <span className="text-xs text-slate-400 dark:text-white/40 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base truncate mb-1 group-hover:text-civic-600 dark:group-hover:text-civic-400 transition-colors">
                  {complaint.title}
                </h3>
                <p className="text-slate-500 dark:text-white/60 text-sm line-clamp-1">
                  {complaint.description}
                </p>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getStatusBadgeClass(complaint.status)}`}>
                    <span className="flex items-center gap-1.5 capitalize">
                      {getStatusIcon(complaint.status)}
                      {complaint.status.replace("_", " ")}
                    </span>
                  </Badge>
                  {complaint.priority && (
                    <Badge className={`${getPriorityBadgeClass(complaint.priority)}`}>
                      {complaint.priority}
                    </Badge>
                  )}
                </div>
                <Link to={`/citizen/complaints/${complaint.id}`}>
                  <Button variant="outline" size="sm" className="hover:border-civic-500 hover:text-civic-500 dark:hover:text-civic-400">
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-6">
          <p className="text-sm text-slate-500 dark:text-white/40">
            Showing Page <span className="font-semibold text-slate-700 dark:text-white">{page}</span> of{" "}
            <span className="font-semibold text-slate-700 dark:text-white">{totalPages}</span> ({total} total complaints)
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
