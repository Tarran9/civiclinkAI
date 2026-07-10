import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBloodRequests } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import {
  BLOOD_GROUPS,
  BLOOD_REQUEST_STATUSES,
  BLOOD_URGENCY_LEVELS,
  DEFAULT_PAGE_SIZE,
} from "@/constants";
import {
  Plus,
  Search,
  Droplets,
  MapPin,
  Calendar,
  AlertTriangle,
  Heart,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
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
import type { BloodGroup, BloodRequestStatus } from "@/types";

export function BloodRequestsPage() {
  const [page, setPage] = useState(1);
  const [bloodGroup, setBloodGroup] = useState<string>("all");
  const [status, setStatus] = useState<string>("open");

  const queryFilters = {
    bloodGroup: bloodGroup !== "all" ? (bloodGroup as BloodGroup) : undefined,
    status: status !== "all" ? (status as BloodRequestStatus) : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bloodRequests", "list", page, queryFilters],
    queryFn: () => getBloodRequests(page, DEFAULT_PAGE_SIZE, queryFilters),
    placeholderData: (prev) => prev,
  });

  const requests = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case "normal":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      case "urgent":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse border-rose-200 dark:border-rose-900";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getStatusBadge = (status: string) => {
    const matched = BLOOD_REQUEST_STATUSES.find((s) => s.value === status);
    return matched ? matched.label : status;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400";
      case "fulfilled":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "cancelled":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/20 dark:text-slate-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">
            Emergency Blood Requests
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
            View active requests or search/register as a blood donor.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.CITIZEN.BLOOD_SEARCH}>
            <Button variant="outline" className="rounded-xl border-slate-200 dark:border-white/10">
              Search Donors
            </Button>
          </Link>
          <Link to={ROUTES.CITIZEN.BLOOD_REQUEST_NEW}>
            <Button className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 gap-2">
              <Plus className="w-4 h-4" />
              Request Blood
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/15 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Blood group selection */}
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

          {/* Status selection */}
          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-36 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Link to={ROUTES.CITIZEN.BLOOD_DONATE} className="w-full md:w-auto">
          <Button variant="ghost" className="w-full md:w-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 rounded-xl gap-2 font-semibold">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            Register as Donor
          </Button>
        </Link>
      </div>

      {/* Requests Listings */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load blood requests</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {error instanceof Error ? error.message : "Something went wrong while fetching data."}
          </p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center mx-auto">
            <Droplets className="w-8 h-8 text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-xl font-bold">No active requests found</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm max-w-sm mx-auto">
            There are currently no active blood donor requests matching the filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
            >
              {/* Blood group watermark glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full flex items-center justify-center pointer-events-none" />

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-display font-black text-xl flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                    {request.blood_group}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`${getStatusClass(request.status)} font-semibold py-0.5 px-2`}>
                      {getStatusBadge(request.status)}
                    </Badge>
                    <Badge className={`${getUrgencyClass(request.urgency)} capitalize py-0.5 px-2`}>
                      {request.urgency}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg line-clamp-1 mb-2">
                  Needed for {request.patient_name}
                </h3>
                <p className="text-slate-500 dark:text-white/60 text-sm line-clamp-2 leading-relaxed mb-4">
                  {request.notes || request.ai_summary || `${request.units_required} units requested.`}
                </p>
              </div>

              {/* hospital & metadata details */}
              <div className="border-t border-slate-50 dark:border-white/5 pt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/70">
                  <Hospital className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{request.hospital_name}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-white/40">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    City: {request.hospital_address || "Not specified"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Requested: {new Date(request.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-white/50 truncate max-w-[120px]">
                      {request.profiles?.full_name || "Requester"}
                    </span>
                  </div>
                  {request.contact_number && request.status === "open" && (
                    <a href={`tel:${request.contact_number}`} onClick={(e) => e.stopPropagation()}>
                      <Button variant="outline" size="sm" className="hover:bg-rose-50 hover:text-rose-600 border-slate-200 dark:border-white/10 gap-1.5 text-xs rounded-xl">
                        <Phone className="w-3.5 h-3.5" />
                        Call Requester
                      </Button>
                    </a>
                  )}
                </div>
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
