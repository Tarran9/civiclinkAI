import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComplaintById, updateComplaint } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  DEPARTMENTS,
} from "@/constants";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  Building,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { ComplaintCategory, ComplaintPriority } from "@/types";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(15, "Description must be at least 15 characters"),
  address: z.string().min(5, "Please enter a specific address/location"),
  priority: z.string(),
  department: z.string(),
});

type FormData = z.infer<typeof schema>;

export function ComplaintEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: complaint, isLoading, isError, error } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => getComplaintById(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  });

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");
  const selectedDept = watch("department");

  // Load initial data
  useEffect(() => {
    if (complaint) {
      // Ensure only pending complaints are editable
      if (complaint.status !== "pending") {
        toast.error("Only complaints in 'Pending' review state can be modified.");
        navigate(`/citizen/complaints/${complaint.id}`);
        return;
      }

      reset({
        title: complaint.title,
        category: complaint.category,
        description: complaint.description,
        address: complaint.location || "",
        priority: complaint.priority || "medium",
        department: complaint.assigned_department || "Municipal Corporation",
      });
    }
  }, [complaint, reset, navigate]);

  const updateMutation = useMutation({
    mutationFn: (vals: FormData) => {
      return updateComplaint(id!, {
        title: vals.title,
        description: vals.description,
        category: vals.category as ComplaintCategory,
        location: vals.address,
        priority: vals.priority as ComplaintPriority,
        assigned_department: vals.department,
      });
    },
    onSuccess: () => {
      toast.success("Complaint updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint", id] });
      navigate(`/citizen/complaints/${id}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update complaint.");
    },
  });

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

  if (isError || !complaint) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Error loading complaint</h2>
        <p className="text-slate-500 text-sm">
          {error instanceof Error ? error.message : "The requested complaint does not exist or has been deleted."}
        </p>
        <Link to={ROUTES.CITIZEN.COMPLAINTS}>
          <Button className="bg-civic-500 hover:bg-civic-600 text-white rounded-xl">
            Return to List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2">
        <Link to={`/citizen/complaints/${id}`}>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Details
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">
          Edit Complaint
        </h1>
        <p className="text-slate-500 dark:text-white/60 text-sm">
          Modify the details of your submitted complaint ticket.
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
        <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display font-bold">Edit Details</CardTitle>
            <CardDescription>Only pending complaints can be updated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Complaint Title
              </label>
              <Input
                placeholder="e.g. Large pothole near Central Park gate"
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

            {/* Category & Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={(val) => setValue("category", val)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                  Target Department
                </label>
                <Select
                  value={selectedDept}
                  onValueChange={(val) => setValue("department", val)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Location Address
              </label>
              <Input
                placeholder="e.g. 14th Main, Sector 3, HSR Layout"
                {...register("address")}
                className="rounded-xl border-slate-200 dark:border-white/10"
              />
              {errors.address && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Description of Issue
              </label>
              <Textarea
                placeholder="Describe the issue in detail..."
                {...register("description")}
                rows={5}
                className="rounded-xl border-slate-200 dark:border-white/10"
              />
              {errors.description && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80 block">
                Urgency / Severity
              </label>
              <div className="flex flex-wrap gap-2">
                {COMPLAINT_PRIORITIES.map((p) => {
                  const isSelected = selectedPriority === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setValue("priority", p.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        isSelected
                          ? "bg-civic-500 border-civic-500 text-white shadow-md"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <span className="capitalize">{p.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
            <Link to={`/citizen/complaints/${id}`}>
              <Button type="button" variant="ghost" className="rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || updateMutation.isPending}
              className="bg-gradient-to-r from-civic-600 to-civic-500 hover:from-civic-700 hover:to-civic-600 text-white rounded-xl shadow-lg shadow-civic-500/20 px-6 gap-1.5"
            >
              {isSubmitting || updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
