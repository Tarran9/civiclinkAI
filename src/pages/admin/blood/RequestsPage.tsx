import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBloodRequests, updateBloodRequest } from "@/services/supabase";
import {
  BLOOD_GROUPS,
  BLOOD_REQUEST_STATUSES,
  DEFAULT_PAGE_SIZE,
} from "@/constants";
import {
  Heart,
  Droplets,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sliders,
  Hospital,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { BloodGroup, BloodRequestStatus } from "@/types";

export function AdminBloodRequestsPage() {
  const [page, setPage] = useState(1);
  const [bloodGroup, setBloodGroup] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const queryClient = useQueryClient();

  const queryFilters = {
    bloodGroup: bloodGroup !== "all" ? (bloodGroup as BloodGroup) : undefined,
    status: status !== "all" ? (status as BloodRequestStatus) : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminBloodRequests", page, queryFilters],
    queryFn: () => getBloodRequests(page, DEFAULT_PAGE_SIZE, queryFilters),
    placeholderData: (prev) => prev,
  });

  const requests = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  const statusMutation = useMutation({
    mutationFn: ({ requestId, status }: { requestId: string; status: BloodRequestStatus }) => {
      return updateBloodRequest(requestId, { status });
    },
    onSuccess: () => {
      toast.success("Blood request status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["adminBloodRequests"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to change status.");
    },
  });

  const handleStatusChange = (requestId: string, statusVal: string) => {
    statusMutation.mutate({ requestId, status: statusVal as BloodRequestStatus });
  };

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case "normal":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "urgent":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400";
      case "fulfilled":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "cancelled":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400";
      case "expired":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Droplets className="w-8 h-8 text-rose-500 fill-rose-500" />
          Manage Blood Requests
        </h1>
        <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
          Review emergency blood requests and moderate status.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/15 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Blood group */}
          <Select value={bloodGroup} onValueChange={(val) => { setBloodGroup(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-44 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {BLOOD_GROUPS.map((g) => (
                <SelectItem key={g} value={g}>
                  {g} Group
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {BLOOD_REQUEST_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requests table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load requests database</h2>
          <p className="text-slate-500 text-sm">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold">No requests found</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            Adjust search categories or status parameters.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4">Patient / Hospital</th>
                  <th className="p-4">Required Group</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 text-slate-900 dark:text-white">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {request.patient_name} ({request.units_required} Units)
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Hospital className="w-3.5 h-3.5" />
                          {request.hospital_name}, {request.hospital_address}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 font-display font-black text-sm">
                        {request.blood_group}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={`${getUrgencyClass(request.urgency)}`}>
                        {request.urgency}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className={`${getStatusClass(request.status)}`}>
                        {request.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Select
                        defaultValue={request.status}
                        onValueChange={(val) => handleStatusChange(request.id, val)}
                        disabled={statusMutation.isPending}
                      >
                        <SelectTrigger className="w-32 rounded-xl inline-flex text-xs h-9 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_REQUEST_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
            <span className="font-semibold text-slate-700 dark:text-white">{totalPages}</span> ({total} total requests)
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
