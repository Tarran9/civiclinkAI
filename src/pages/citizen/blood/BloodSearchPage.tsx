import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBloodDonors } from "@/services/supabase";
import { ROUTES } from "@/constants/routes";
import { BLOOD_GROUPS, DEFAULT_PAGE_SIZE } from "@/constants";
import {
  ArrowLeft,
  Search,
  Droplets,
  MapPin,
  Heart,
  Phone,
  Mail,
  User,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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
import type { BloodGroup } from "@/types";

export function BloodSearchPage() {
  const [page, setPage] = useState(1);
  const [bloodGroup, setBloodGroup] = useState<string>("all");
  const [city, setCity] = useState("");

  const queryFilters = {
    bloodGroup: bloodGroup !== "all" ? (bloodGroup as BloodGroup) : undefined,
    city: city ? city : undefined,
    isAvailable: true, // Only search available donors
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["bloodDonors", "search", page, queryFilters],
    queryFn: () => getBloodDonors(page, DEFAULT_PAGE_SIZE, queryFilters),
    placeholderData: (prev) => prev,
  });

  const donors = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link to={ROUTES.CITIZEN.BLOOD_REQUESTS}>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Requests
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          Find Blood Donors
        </h1>
        <p className="text-slate-500 dark:text-white/60 text-sm">
          Search for registered community blood donors in your city.
        </p>
      </div>

      {/* Search filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/15 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 w-full">
          {/* Blood group select */}
          <div className="w-full md:w-56">
            <Select value={bloodGroup} onValueChange={(val) => { setBloodGroup(val); setPage(1); }}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl">
                <SelectValue placeholder="Blood Group Required" />
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

          {/* City search input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
              placeholder="Search by city (e.g. Bangalore, Mumbai...)"
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Donors list */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-5 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Failed to load donor database</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            {error instanceof Error ? error.message : "Something went wrong while pulling donors."}
          </p>
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto">
            <User className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold">No donors found</h2>
          <p className="text-slate-500 dark:text-white/40 text-sm max-w-sm mx-auto">
            Try matching a different blood group or search across another city location.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {donors.map((donor) => (
            <div
              key={donor.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-rose-500/10">
                      {donor.profiles?.full_name?.charAt(0).toUpperCase() ?? "D"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                        {donor.profiles?.full_name || "Anonymous Donor"}
                      </h3>
                      <span className="text-xs text-slate-400 dark:text-white/40 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {donor.city}
                      </span>
                    </div>
                  </div>

                  <Badge className="bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 font-display font-black text-sm py-1 px-2.5 rounded-xl">
                    {donor.blood_group}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-slate-50 dark:border-white/5 pt-4 mt-2 flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Available to Donate
                  </span>
                </div>

                <div className="flex gap-2 mt-1">
                  {donor.contact_number && (
                    <a href={`tel:${donor.contact_number}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full hover:bg-rose-50 hover:text-rose-600 border-slate-200 dark:border-white/10 gap-1.5 text-xs rounded-xl">
                        <Phone className="w-3.5 h-3.5" />
                        Call
                      </Button>
                    </a>
                  )}
                  {donor.profiles?.email && (
                    <a href={`mailto:${donor.profiles.email}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full hover:bg-slate-50 border-slate-200 dark:border-white/10 gap-1.5 text-xs rounded-xl">
                        <Mail className="w-3.5 h-3.5" />
                        Email
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
            <span className="font-semibold text-slate-700 dark:text-white">{totalPages}</span> ({total} total available donors)
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
