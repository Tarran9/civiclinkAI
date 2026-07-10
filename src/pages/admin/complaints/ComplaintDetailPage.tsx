import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComplaintById, updateComplaint } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  COMPLAINT_PRIORITIES,
  DEPARTMENTS,
} from "@/constants";
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
  Shield,
  Loader2,
  Sparkles,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ComplaintStatus, ComplaintPriority } from "@/types";

export function AdminComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: complaint, isLoading, isError, error } = useQuery({
    queryKey: ["adminComplaint", id],
    queryFn: () => getComplaintById(id!),
    enabled: !!id,
  });

  // Admin form state
  const [status, setStatus] = useState<ComplaintStatus>("pending");
  const [priority, setPriority] = useState<ComplaintPriority>("medium");
  const [dept, setDept] = useState("Municipal Corporation");
  const [comments, setComments] = useState("");

  // Sync state with loaded complaint
  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setPriority(complaint.priority as ComplaintPriority || "medium");
      setDept(complaint.assigned_department || "Municipal Corporation");
      setComments(complaint.admin_notes || "");
    }
  }, [complaint]);

  const updateMutation = useMutation({
    mutationFn: () => {
      return updateComplaint(id!, {
        status,
        priority,
        assigned_department: dept,
        admin_notes: comments,
      });
    },
    onSuccess: () => {
      toast.success("Ticket details and status updated.");
      queryClient.invalidateQueries({ queryKey: ["adminComplaints"] });
      queryClient.invalidateQueries({ queryKey: ["adminComplaint", id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update ticket.");
    },
  });

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

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </Card>
      </div>
    );
  }

  if (isError || !complaint) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Ticket not found</h2>
        <p className="text-slate-500 text-sm">
          {error instanceof Error ? error.message : "The requested complaint ticket does not exist."}
        </p>
        <Link to={ROUTES.ADMIN.COMPLAINTS}>
          <Button className="bg-violet-500 hover:bg-violet-600 text-white rounded-xl">
            Return to List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header back link */}
      <div className="flex justify-between items-center">
        <Link to={ROUTES.ADMIN.COMPLAINTS}>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Tickets
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-white/5 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <Badge variant="outline" className={`${getStatusColor(complaint.status)} border py-0.5 px-2 rounded-lg capitalize font-semibold`}>
                  <span className="flex items-center gap-1.5">
                    {getStatusIcon(complaint.status)}
                    {complaint.status.replace("_", " ")}
                  </span>
                </Badge>
                {complaint.priority && (
                  <Badge className={`${getPriorityClass(complaint.priority)}`}>
                    {complaint.priority} Priority
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-display font-black text-slate-900 dark:text-white">
                {complaint.title}
              </h2>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Image Evidence */}
              {complaint.complaint_images && complaint.complaint_images.length > 0 && (
                <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 max-h-80">
                  <img
                    src={complaint.complaint_images[0].public_url}
                    alt="Complaint Evidence"
                    className="w-full h-full max-h-80 object-contain"
                  />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  Citizen Description
                </h3>
                <p className="text-slate-600 dark:text-white/80 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                  {complaint.description}
                </p>
              </div>

              {/* Metadata rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-50 dark:border-white/5 pt-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 font-semibold">Location / Address</p>
                    <p className="text-slate-700 dark:text-white/80 font-medium">{complaint.location || "Not specified"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 font-semibold">Filing Date</p>
                    <p className="text-slate-700 dark:text-white/80 font-medium">
                      {new Date(complaint.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 font-semibold">Reporter Name</p>
                    <p className="text-slate-700 dark:text-white/80 font-medium">{complaint.profiles?.full_name || "Citizen User"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-slate-400 font-semibold">Assigned Dept</p>
                    <p className="text-slate-700 dark:text-white/80 font-medium">{complaint.assigned_department || "Municipal Corporation"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Controls Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardHeader className="border-b border-slate-50 dark:border-white/5 pb-4">
              <CardTitle className="text-base font-display font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-500" />
                Moderation Controls
              </CardTitle>
              <CardDescription>Actions to resolve and route ticket.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Ticket Resolution Status</label>
                <Select value={status} onValueChange={(val) => setStatus(val as ComplaintStatus)}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Urgency Severity Level</label>
                <Select value={priority} onValueChange={(val) => setPriority(val as ComplaintPriority)}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPLAINT_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Route Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Assign Operations Dept</label>
                <Select value={dept} onValueChange={setDept}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resolution Feedback text area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Admin comments / Feedback</label>
                <Textarea
                  placeholder="Provide resolution details or feedback for citizen..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={4}
                  className="rounded-xl border-slate-200 dark:border-white/10"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
              <Button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-500/20 px-6 w-full gap-1.5"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Apply Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
