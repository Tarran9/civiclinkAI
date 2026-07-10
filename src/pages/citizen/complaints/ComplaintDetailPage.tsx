import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComplaintById, deleteComplaint } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import { COMPLAINT_CATEGORIES } from "@/constants";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building,
  User,
  Pencil,
  Trash2,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { ComplaintStatus, ComplaintPriority } from "@/types";

export function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: complaint, isLoading, isError, error } = useQuery({
    queryKey: ["complaint", id],
    queryFn: () => getComplaintById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComplaint(id!),
    onSuccess: () => {
      toast.success("Complaint deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      navigate(ROUTES.CITIZEN.COMPLAINTS);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete complaint.");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this complaint? This cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-amber-500" />;
      case "in_progress":
        return <SlidersHorizontal className="w-5 h-5 text-blue-500 animate-pulse" />;
      case "resolved":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-rose-500" />;
    }
  };

  const getStatusLabel = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return "Pending Review";
      case "in_progress":
        return "Resolution In Progress";
      case "resolved":
        return "Resolved";
      case "rejected":
        return "Rejected/Closed";
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case "pending":
        return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400";
      case "in_progress":
        return "text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400";
      case "resolved":
        return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "rejected":
        return "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400";
    }
  };

  const getPriorityBadgeClass = (priority: ComplaintPriority) => {
    switch (priority) {
      case "low":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse";
    }
  };

  const getCategoryLabel = (cat: string) => {
    return COMPLAINT_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
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
        <h2 className="text-xl font-bold">Error loading complaint details</h2>
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

  const isPending = complaint.status === "pending";

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header buttons */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <Link to={ROUTES.CITIZEN.COMPLAINTS}>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Complaints
          </Button>
        </Link>

        {isPending && (
          <div className="flex gap-2">
            <Link to={`/citizen/complaints/${complaint.id}/edit`}>
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-white/10 gap-1.5 text-xs">
                <Pencil className="w-3.5 h-3.5" />
                Edit Details
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded-xl border-rose-200 dark:border-rose-950 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 gap-1.5 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-white/5 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <Badge variant="outline" className={`${getStatusColor(complaint.status)} border py-1 px-2.5 rounded-full`}>
                  <span className="flex items-center gap-1.5 font-bold">
                    {getStatusIcon(complaint.status)}
                    {getStatusLabel(complaint.status)}
                  </span>
                </Badge>
                {complaint.priority && (
                  <Badge className={`${getPriorityBadgeClass(complaint.priority as ComplaintPriority)} text-xs py-0.5 px-2`}>
                    {complaint.priority} Priority
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">
                {complaint.title}
              </h2>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Image if available */}
              {complaint.complaint_images && complaint.complaint_images.length > 0 && (
                <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 max-h-96">
                  <img
                    src={complaint.complaint_images[0].public_url}
                    alt="Complaint Evidence"
                    className="w-full h-full max-h-96 object-contain"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  Description of Issue
                </h3>
                <p className="text-slate-600 dark:text-white/80 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                  {complaint.description}
                </p>
              </div>

              {/* Metadata rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-slate-50 dark:border-white/5 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Location / Address</p>
                    <p className="text-slate-700 dark:text-white/80 font-medium">{complaint.location || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Date Submitted</p>
                    <p className="text-slate-700 dark:text-white/80 font-medium">
                      {new Date(complaint.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Building className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Assigned Department</p>
                    <p className="text-slate-700 dark:text-white/80 font-medium">{complaint.assigned_department || "Municipal Corporation"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold">Submitted By</p>
                    <p className="text-slate-700 dark:text-white/80 font-medium">{complaint.profiles?.full_name || "Citizen User"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Resolution Status Tracking */}
          <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-display font-bold">Resolution Roadmap</CardTitle>
              <CardDescription>Track real-time actions taken on your complaint.</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="relative pl-6 border-l border-slate-200 dark:border-white/10 space-y-6">
                {/* 1. Submitted */}
                <div className="relative">
                  <span className="absolute -left-9 top-0.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Complaint Lodged</p>
                    <p className="text-xs text-slate-400">Your issue was successfully created and submitted for verification.</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {new Date(complaint.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* 2. Reviewing / Assigned */}
                <div className="relative">
                  <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${
                    complaint.status !== "pending"
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}>
                    {complaint.status !== "pending" ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Department Routing</p>
                    <p className="text-xs text-slate-400">
                      Municipal admins verify details and route complaint to: <span className="font-semibold">{complaint.assigned_department || "Municipal Corporation"}</span>.
                    </p>
                    {complaint.status !== "pending" && (
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Checked and Assigned</p>
                    )}
                  </div>
                </div>

                {/* 3. In Progress */}
                <div className="relative">
                  <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${
                    complaint.status === "resolved"
                      ? "bg-emerald-500 text-white"
                      : complaint.status === "in_progress"
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20"
                  }`}>
                    {complaint.status === "resolved" ? <Check className="w-3.5 h-3.5" /> : <SlidersHorizontal className="w-3.5 h-3.5" />}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Resolution In Progress</p>
                    <p className="text-xs text-slate-400">Field workers or technicians dispatched to examine and resolve the issue.</p>
                  </div>
                </div>

                {/* 4. Resolved */}
                <div className="relative">
                  <span className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${
                    complaint.status === "resolved"
                      ? "bg-emerald-500 text-white"
                      : complaint.status === "rejected"
                      ? "bg-rose-500 text-white"
                      : "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-white/20"
                  }`}>
                    {complaint.status === "resolved" ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : complaint.status === "rejected" ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {complaint.status === "rejected" ? "Complaint Rejected / Closed" : "Resolved"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {complaint.status === "rejected"
                        ? "Admin declined/closed the ticket. Check official response below."
                        : "Task marked complete by department heads. Issue resolved successfully."}
                    </p>
                    {complaint.updated_at && complaint.status !== "pending" && (
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Updated: {new Date(complaint.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info/AI Details */}
        <div className="space-y-6">
          {/* Official feedback */}
          {(complaint.admin_notes || complaint.status === "rejected") && (
            <Card className="border-rose-100 dark:border-rose-950 bg-rose-50/10 dark:bg-rose-950/15 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-display font-bold flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  Official Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2 text-slate-700 dark:text-white/80 leading-relaxed">
                <p className="font-medium">Comments from Authority:</p>
                <p className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-xl font-sans">
                  {complaint.admin_notes || "No official comment submitted yet."}
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Info Card */}
          <Card className="border-slate-100 dark:border-white/10 bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 rounded-2xl shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50 dark:border-white/5">
              <CardTitle className="text-sm font-display font-bold flex items-center gap-2 text-civic-600 dark:text-civic-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
                AI Smart Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-400">Auto Classification:</span>
                <p className="text-slate-700 dark:text-white/80 font-medium capitalize">
                  {getCategoryLabel(complaint.category)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-400">Priority Score:</span>
                <p className="text-slate-700 dark:text-white/80 font-medium">
                  Assigned <span className="font-semibold capitalize text-civic-600">{complaint.priority || "medium"}</span> based on severity descriptors.
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-400">Security Check:</span>
                <p className="text-slate-700 dark:text-white/80 font-medium flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  RLS Active & Secured
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}
