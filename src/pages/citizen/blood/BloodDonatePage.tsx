import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getBloodDonorByUserId, upsertBloodDonor } from "@/services/supabase";
import { BLOOD_GROUPS } from "@/constants";
import {
  Heart,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { BloodGroup } from "@/types";

const schema = z.object({
  bloodGroup: z.string().min(1, "Please select your blood group"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  city: z.string().min(3, "City must be at least 3 characters"),
  isAvailable: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

export function BloodDonatePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: donor, isLoading, isError, error } = useQuery({
    queryKey: ["bloodDonor", user?.id],
    queryFn: () => getBloodDonorByUserId(user!.id),
    enabled: !!user?.id,
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
    defaultValues: {
      bloodGroup: "",
      phone: "",
      city: "",
      isAvailable: true,
    },
  });

  const selectedBloodGroup = watch("bloodGroup");
  const isAvailable = watch("isAvailable");

  // Load existing donor data if registered
  useEffect(() => {
    if (donor) {
      reset({
        bloodGroup: donor.blood_group,
        phone: donor.contact_number || "",
        city: donor.city || "",
        isAvailable: donor.is_available ?? true,
      });
    }
  }, [donor, reset]);

  const upsertMutation = useMutation({
    mutationFn: (vals: FormData) => {
      if (!user) throw new Error("User session not found.");
      return upsertBloodDonor({
        user_id: user.id,
        blood_group: vals.bloodGroup as BloodGroup,
        contact_number: vals.phone,
        city: vals.city,
        state: "",
        is_available: vals.isAvailable,
      });
    },
    onSuccess: () => {
      toast.success(
        donor
          ? "Donor profile updated successfully!"
          : "Registered as a blood donor! Thank you for your support ❤️"
      );
      queryClient.invalidateQueries({ queryKey: ["bloodDonor", user?.id] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to save donor settings.");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          Blood Donor Registration
        </h1>
        <p className="text-slate-500 dark:text-white/60 text-sm">
          Register as an emergency blood donor to receive requests and help save lives in your community.
        </p>
      </div>

      {donor && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">Active Donor Registered</p>
            <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">
              Your profile is visible to emergency blood seekers. Thank you for your generosity.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit((data) => upsertMutation.mutate(data))} className="space-y-6">
        <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display font-bold">Donor Information</CardTitle>
            <CardDescription>
              Keep your contact details and availability status up-to-date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Blood Group */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                Blood Group / Type
              </label>
              <Select
                value={selectedBloodGroup}
                onValueChange={(val) => setValue("bloodGroup", val)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bloodGroup && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.bloodGroup.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1">
                <Phone className="w-4 h-4 text-slate-400" />
                Contact Phone Number
              </label>
              <Input
                placeholder="e.g. +91 98765 43210"
                {...register("phone")}
                className="rounded-xl border-slate-200 dark:border-white/10"
              />
              {errors.phone && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                City / Location
              </label>
              <Input
                placeholder="e.g. Bangalore, Delhi, Mumbai"
                {...register("city")}
                className="rounded-xl border-slate-200 dark:border-white/10"
              />
              {errors.city && (
                <p className="text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Availability Switch */}
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-white/5 pt-5">
              <div className="space-y-0.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80 block">
                  Available for Donation
                </label>
                <span className="text-xs text-slate-500 dark:text-white/40">
                  Toggle off if you are temporarily unable or do not wish to donate right now.
                </span>
              </div>
              <Switch
                checked={isAvailable}
                onCheckedChange={(checked) => setValue("isAvailable", checked)}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
            <Button
              type="submit"
              disabled={isSubmitting || upsertMutation.isPending}
              className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 px-6"
            >
              {isSubmitting || upsertMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : donor ? (
                "Update Donor Profile"
              ) : (
                "Register as Donor"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
