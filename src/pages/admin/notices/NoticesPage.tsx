import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotices, deleteNotice, updateNotice } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import { NOTICE_CATEGORIES, DEFAULT_PAGE_SIZE } from "@/constants";
import {
  Megaphone,
  Pin,
  Search,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe,
  Archive,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function AdminNoticesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const queryFilters = {
    search: search ? search : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminNotices", page, queryFilters],
    queryFn: () => getNotices(page, DEFAULT_PAGE_SIZE, queryFilters),
    placeholderData: (prev) => prev,
  });

  const notices = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  const deleteMutation = useMutation({
    mutationFn: (noticeId: string) => {
      return deleteNotice(noticeId);
    },
    onSuccess: () => {
      toast.success("Notice deleted.");
      queryClient.invalidateQueries({ queryKey: ["adminNotices"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete notice.");
    },
  });

  const publishMutation = useMutation({
    mutationFn: ({ noticeId, isPublished }: { noticeId: string; isPublished: boolean }) => {
      return updateNotice(noticeId, { is_published: isPublished });
    },
    onSuccess: () => {
      toast.success("Publish status updated.");
      queryClient.invalidateQueries({ queryKey: ["adminNotices"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to change status.");
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ noticeId, isPinned }: { noticeId: string; isPinned: boolean }) => {
      return updateNotice(noticeId, { is_pinned: isPinned });
    },
    onSuccess: () => {
      toast.success("Pin status updated.");
      queryClient.invalidateQueries({ queryKey: ["adminNotices"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to toggle pin.");
    },
  });

  const getCategoryColor = (cat: string) => {
    const matched = NOTICE_CATEGORIES.find((c) => c.value === cat);
    return matched ? matched.color : "bg-slate-100 text-slate-700";
  };

  const getCategoryLabel = (cat: string) => {
    const matched = NOTICE_CATEGORIES.find((c) => c.value === cat);
    return matched ? matched.label : cat;
  };

  const handleDelete = (noticeId: string) => {
    if (window.confirm("Are you sure you want to delete this notice? This cannot be undone.")) {
      deleteMutation.mutate(noticeId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-violet-500" />
            Manage Notices
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
            Publish announcements, alerts, and municipal events to the citizen board.
          </p>
        </div>
        <Link to={ROUTES.ADMIN.NOTICE_NEW}>
          <Button className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white rounded-xl shadow-lg shadow-violet-500/20 gap-2">
            <Plus className="w-4 h-4" />
            Create Announcement
          </Button>
        </Link>
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
            placeholder="Search notices..."
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
          />
        </div>
      </div>

      {/* Results grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load notices database</h2>
          <p className="text-slate-500 text-sm">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold">No notices match search</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            Create a new notice or adjust search terms.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-4 relative overflow-hidden group ${
                notice.is_pinned
                  ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/10 dark:bg-amber-950/5"
                  : "border-slate-100 dark:border-white/10"
              }`}
            >
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`${getCategoryColor(notice.category)} border py-0.5 px-2 rounded-lg font-semibold capitalize`}>
                    {getCategoryLabel(notice.category)}
                  </Badge>

                  {notice.is_pinned && (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 gap-1 rounded-lg py-0.5 px-2">
                      <Pin className="w-3 h-3 fill-amber-500 text-amber-500" />
                      Pinned
                    </Badge>
                  )}

                  {!notice.is_published && (
                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-850 dark:text-slate-400">
                      Draft
                    </Badge>
                  )}

                  <span className="text-xs text-slate-400 dark:text-white/40 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg leading-snug">
                  {notice.title}
                </h3>
                <p className="text-slate-500 dark:text-white/60 text-sm line-clamp-1">
                  {notice.content}
                </p>
              </div>

              {/* admin action buttons */}
              <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0 self-start md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-50 dark:border-white/5 w-full md:w-auto justify-end">
                {/* Pin button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pinMutation.mutate({ noticeId: notice.id, isPinned: !notice.is_pinned })}
                  className="rounded-xl hover:border-amber-500 hover:text-amber-500 text-xs px-2.5 h-9"
                >
                  <Pin className={`w-3.5 h-3.5 ${notice.is_pinned ? "fill-amber-500 text-amber-500" : ""}`} />
                </Button>

                {/* Publish button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => publishMutation.mutate({ noticeId: notice.id, isPublished: !notice.is_published })}
                  className="rounded-xl text-xs px-2.5 h-9"
                >
                  {notice.is_published ? (
                    <>
                      <Archive className="w-3.5 h-3.5 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5 mr-1" />
                      Publish
                    </>
                  )}
                </Button>

                {/* Edit */}
                <Link to={`/admin/notices/${notice.id}/edit`}>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs px-2.5 h-9 gap-1">
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </Link>

                {/* Delete */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(notice.id)}
                  disabled={deleteMutation.isPending}
                  className="rounded-xl border-rose-200 dark:border-rose-950 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs px-2.5 h-9 gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
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
            <span className="font-semibold text-slate-700 dark:text-white">{totalPages}</span> ({total} total notices)
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
