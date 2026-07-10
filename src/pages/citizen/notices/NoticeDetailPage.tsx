import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getNoticeById } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import { NOTICE_CATEGORIES } from "@/constants";
import {
  ArrowLeft,
  Calendar,
  Pin,
  Megaphone,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: notice, isLoading, isError, error } = useQuery({
    queryKey: ["notice", id],
    queryFn: () => getNoticeById(id!),
    enabled: !!id,
  });

  const getCategoryColor = (cat: string) => {
    const matched = NOTICE_CATEGORIES.find((c) => c.value === cat);
    return matched ? matched.color : "bg-slate-100 text-slate-700";
  };

  const getCategoryLabel = (cat: string) => {
    const matched = NOTICE_CATEGORIES.find((c) => c.value === cat);
    return matched ? matched.label : cat;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </Card>
      </div>
    );
  }

  if (isError || !notice) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto animate-fade-in">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Announcement not found</h2>
        <p className="text-slate-500 text-sm">
          {error instanceof Error ? error.message : "The requested community notice does not exist or has been deleted."}
        </p>
        <Link to={ROUTES.CITIZEN.NOTICES}>
          <Button className="bg-civic-500 hover:bg-civic-600 text-white rounded-xl">
            Back to Notices
          </Button>
        </Link>
      </div>
    );
  }

  const isEmergency = notice.category === "emergency";

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Header back link */}
      <div className="flex items-center">
        <Link to={ROUTES.CITIZEN.NOTICES}>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Notices
          </Button>
        </Link>
      </div>

      <Card className={`border rounded-2xl shadow-sm overflow-hidden ${
        isEmergency
          ? "border-rose-200 dark:border-rose-950/80 bg-rose-50/5 dark:bg-rose-950/5"
          : "border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900"
      }`}>
        <CardHeader className="border-b border-slate-50 dark:border-white/5 pb-5">
          <div className="flex items-center gap-2.5 flex-wrap mb-3">
            <Badge variant="outline" className={`${getCategoryColor(notice.category)} border py-0.5 px-2.5 rounded-lg capitalize font-semibold`}>
              {getCategoryLabel(notice.category)}
            </Badge>

            {notice.is_pinned && (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 gap-1 rounded-lg py-0.5 px-2.5">
                <Pin className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                Pinned Announcement
              </Badge>
            )}

            <span className="text-xs text-slate-400 dark:text-white/40 flex items-center gap-1.5 ml-auto">
              <Calendar className="w-4 h-4" />
              Published: {new Date(notice.created_at).toLocaleDateString()}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-black text-slate-900 dark:text-white leading-snug">
            {notice.title}
          </h2>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
          <p className="text-slate-600 dark:text-white/80 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5">
            {notice.content}
          </p>

          <div className="flex items-center gap-2 pt-4 text-xs text-slate-400 dark:text-white/30 border-t border-slate-50 dark:border-white/5">
            <Bookmark className="w-4 h-4 text-slate-300" />
            <span>Official announcement from CivicLink AI Municipal Administration</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
