import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBloodDonors, updateBloodDonor } from "@/services/supabase";
import { BLOOD_GROUPS, DEFAULT_PAGE_SIZE } from "@/constants";
import {
  Heart,
  Search,
  Droplets,
  MapPin,
  Calendar,
  AlertCircle,
  Phone,
  Mail,
  User,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Power,
  Loader2,
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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { BloodGroup } from "@/types";

export function AdminBloodDonorsPage() {
  const [page, setPage] = useState(1);
  const [bloodGroup, setBloodGroup] = useState<string>("all");
  const [city, setCity] = useState("");
  const queryClient = useQueryClient();

  const queryFilters = {
    bloodGroup: bloodGroup !== "all" ? (bloodGroup as BloodGroup) : undefined,
    city: city ? city : undefined,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminBloodDonors", page, queryFilters],
    queryFn: () => getBloodDonors(page, DEFAULT_PAGE_SIZE, queryFilters),
    placeholderData: (prev) => prev,
  });

  const donors = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  const availabilityMutation = useMutation({
    mutationFn: ({ donorId, isAvailable }: { donorId: string; isAvailable: boolean }) => {
      return updateBloodDonor(donorId, { is_available: isAvailable });
    },
    onSuccess: () => {
      toast.success("Donor availability status toggled.");
      queryClient.invalidateQueries({ queryKey: ["adminBloodDonors"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to toggle status.");
    },
  });

  const toggleAvailability = (donorId: string, currentStatus: boolean) => {
    availabilityMutation.mutate({ donorId, isAvailable: !currentStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          Manage Donors
        </h1>
        <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
          Review, search, and manage registered community blood donors.
        </p>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/15 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <div className="w-full md:w-56">
            <Select value={bloodGroup} onValueChange={(val) => { setBloodGroup(val); setPage(1); }}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl">
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
          </div>

          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by city name..."
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Table grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load donor files</h2>
          <p className="text-slate-500 text-sm">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold">No donors found</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            Adjust search criteria or blood group parameters.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4">Donor Profile</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Blood Group</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Availability</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm">
                {donors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center">
                        {donor.profiles?.full_name?.charAt(0).toUpperCase() || "D"}
                      </div>
                      {donor.profiles?.full_name || "Anonymous Donor"}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-white/70">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Mail className="w-3.5 h-3.5" />
                          {donor.profiles?.email}
                        </span>
                        {donor.contact_number && <span className="pl-5 text-slate-400">{donor.contact_number}</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 font-display font-black text-sm">
                        {donor.blood_group}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-white/70 font-medium">
                      {donor.city}
                    </td>
                    <td className="p-4">
                      {donor.is_available ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {availabilityMutation.isPending && availabilityMutation.variables?.donorId === donor.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        ) : (
                          <Switch
                            checked={donor.is_available ?? false}
                            onCheckedChange={() => toggleAvailability(donor.id, donor.is_available ?? false)}
                          />
                        )}
                        <span className="text-xs text-slate-400">Toggle active</span>
                      </div>
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
            <span className="font-semibold text-slate-700 dark:text-white">{totalPages}</span> ({total} total donors)
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
