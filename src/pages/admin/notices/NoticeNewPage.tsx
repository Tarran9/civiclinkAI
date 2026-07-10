import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNotice } from "@/services/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ROUTES } from "@/constants/routes";
import { NOTICE_CATEGORIES } from "@/constants";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Megaphone,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { NoticeCategory } from "@/types";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(15, "Content must be at least 15 characters"),
  category: z.string().min(1, "Please select a category"),
  isPublished: z.boolean().default(true),
  isPinned: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

export function AdminNoticeNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: "",
      content: "",
      category: "general",
      isPublished: true,
      isPinned: false,
    },
  });

  const selectedCategory = watch("category");
  const isPublished = watch("isPublished");
  const isPinned = watch("isPinned");

  const createMutation = useMutation({
    mutationFn: (vals: FormData) => {
      if (!user) throw new Error("User not found");
      return createNotice({
        author_id: user.id,
        title: vals.title,
        content: vals.content,
        category: vals.category as NoticeCategory,
        is_published: vals.isPublished,
        is_pinned: vals.isPinned,
      });
    },
    onSuccess: () => {
      toast.success("Announcement published successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminNotices"] });
      queryClient.invalidateQueries({ queryKey: ["notices"] });
      navigate(ROUTES.ADMIN.NOTICES);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create announcement.");
    },
  });

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2">
        <Link to={ROUTES.ADMIN.NOTICES}>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Notices
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-8 h-8 text-violet-500" />
          Create Announcement
        </h1>
        <p className="text-slate-500 dark:text-white/60 text-sm">
          Publish a new announcement, safety alert, or municipal notice.
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
        <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display font-bold">Announcement Details</CardTitle>
            <CardDescription>Fill out notice title, details and categories.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Notice Title
              </label>
              <Input
                placeholder="e.g. Scheduled water shutdown on 15th July"
                {...register("title")}
                className="rounded-xl border-slate-200 dark:border-white/10"
              />
              {errors.title && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Notice Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => setValue("category", val)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {NOTICE_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label} Notice
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Announcement Details
              </label>
              <Textarea
                placeholder="Provide details about this announcement. Markdown formatting is supported..."
                {...register("content")}
                rows={7}
                className="rounded-xl border-slate-200 dark:border-white/10"
              />
              {errors.content && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.content.message}
                </p>
              )}
            </div>

            {/* Pin Switch */}
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-5">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80 block">
                  Pin Announcement
                </label>
                <span className="text-xs text-slate-500 dark:text-white/40">
                  Pinned notices stay at the top of the citizen announcement page.
                </span>
              </div>
              <Switch
                checked={isPinned}
                onCheckedChange={(checked) => setValue("isPinned", checked)}
              />
            </div>

            {/* Publish Switch */}
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-5">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80 block">
                  Publish Immediately
                </label>
                <span className="text-xs text-slate-500 dark:text-white/40">
                  If disabled, this notice is saved as draft and not visible to citizens.
                </span>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={(checked) => setValue("isPublished", checked)}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
            <Link to={ROUTES.ADMIN.NOTICES}>
              <Button type="button" variant="ghost" className="rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white rounded-xl shadow-lg shadow-violet-500/20 px-6 gap-1.5"
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Notice
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
