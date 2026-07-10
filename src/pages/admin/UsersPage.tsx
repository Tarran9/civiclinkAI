import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProfiles, updateProfile } from "@/services/supabase";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import {
  Users,
  Search,
  Mail,
  Calendar,
  Shield,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { UserRole, Profile } from "@/types";

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminUsers", page, search],
    queryFn: () => getAllProfiles(page, DEFAULT_PAGE_SIZE, search),
    placeholderData: (prev) => prev,
  });

  const profiles = (data?.data ?? []) as Profile[];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => {
      return updateProfile(userId, { role });
    },
    onSuccess: () => {
      toast.success("User role updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to change user role.");
    },
  });

  const handleRoleChange = (userId: string, role: string) => {
    roleMutation.mutate({ userId, role: role as UserRole });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-violet-500" />
            Citizen Directory
          </h1>
          <p className="text-slate-500 dark:text-white/60 text-sm mt-1">
            Search users and assign permissions (Admin vs Citizen role).
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/15 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by full name or email address..."
            className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
          />
        </div>
      </div>

      {/* Users table */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load profiles</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <h2 className="text-xl font-bold">No users match query</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm">
            Try adjusting your search keywords.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-4">Citizen Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5 text-sm">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-slate-50/40 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center">
                        {profile.full_name?.charAt(0).toUpperCase() || "C"}
                      </div>
                      {profile.full_name || "Anonymous citizen"}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-white/70">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-500 dark:text-white/40">
                          <Mail className="w-3.5 h-3.5" />
                          {profile.email}
                        </span>
                        {profile.phone && <span className="pl-5 text-slate-400">{profile.phone}</span>}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={
                        profile.role === "admin"
                          ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400 border border-violet-200 dark:border-violet-900/50"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }>
                        <span className="flex items-center gap-1 capitalize">
                          <Shield className="w-3.5 h-3.5" />
                          {profile.role}
                        </span>
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Select
                        defaultValue={profile.role}
                        onValueChange={(val) => handleRoleChange(profile.id, val)}
                        disabled={roleMutation.isPending}
                      >
                        <SelectTrigger className="w-32 rounded-xl inline-flex text-xs h-9 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10">
                          <SelectValue placeholder="Change Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="citizen">Citizen</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
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
            <span className="font-semibold text-slate-700 dark:text-white">{totalPages}</span> ({total} total users)
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
