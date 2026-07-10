import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getNotices } from "@/services/supabase";
import { NOTICE_CATEGORIES, DEFAULT_PAGE_SIZE } from "@/constants";
import {
  Megaphone,
  Pin,
  Search,
  Calendar,
  Eye,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { NoticeCategory } from "@/types";

export function NoticesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const queryFilters = {
    isPublished: true, // Citizens only see published notices
    search: search ? search : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notices", "list", page, queryFilters],
    queryFn: () => getNotices(page, DEFAULT_PAGE_SIZE, queryFilters),
    placeholderData: (prev) => prev,
  });

  const notices = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  const getCategoryColor = (cat: string) => {
    const matched = NOTICE_CATEGORIES.find((c) => c.value === cat);
    return matched ? matched.color : "bg-slate-100 text-slate-700";
  };

  const getCategoryLabel = (cat: string) => {
    const matched = NOTICE_CATEGORIES.find((c) => c.value === cat);
    return matched ? matched.label : cat;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">
            Community Notices
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
            Stay updated with official municipal announcements, emergencies, and development events.
          </p>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/15 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search announcements and notices..."
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
          />
        </div>
      </div>

      {/* Notices listings */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-6 space-y-3">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load notices</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {error instanceof Error ? error.message : "Something went wrong while pulling notices."}
          </p>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto">
            <Megaphone className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold">No announcements found</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm max-w-sm mx-auto">
            There are currently no official announcements posted by the administration.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden group ${
                notice.is_pinned
                  ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/10 dark:bg-amber-950/5"
                  : "border-slate-100 dark:border-white/10"
              }`}
            >
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`${getCategoryColor(notice.category)} border py-0.5 px-2 rounded-lg font-semibold capitalize`}>
                    {getCategoryLabel(notice.category)}
                  </Badge>

                  {notice.is_pinned && (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 gap-1 rounded-lg py-0.5 px-2">
                      <Pin className="w-3 h-3 fill-amber-500 text-amber-500" />
                      Pinned Announcement
                    </Badge>
                  )}

                  <span className="text-xs text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg group-hover:text-civic-600 dark:group-hover:text-civic-400 transition-colors leading-snug">
                  {notice.title}
                </h3>
                <p className="text-slate-500 dark:text-white/60 text-sm leading-relaxed line-clamp-2">
                  {notice.content}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-50 dark:border-white/5 w-full md:w-auto justify-end">
                <Link to={`/citizen/notices/${notice.id}`} className="w-full md:w-auto">
                  <Button variant="outline" size="sm" className="w-full md:w-auto hover:bg-civic-50 hover:text-civic-600 dark:hover:bg-civic-950/20 dark:hover:text-civic-400 rounded-xl gap-1.5 text-xs">
                    <Eye className="w-4 h-4" />
                    Read Announcement
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/10 pt-6">
          <p className="text-sm text-slate-500 dark:text-white/40">
            Showing Page <span className="font-semibold text-slate-700 dark:text-white">{page}</span> of{" "}
            <span className="font-semibold text-slate-700 dark:text-white">{totalPages}</span> ({total} total announcements)
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
