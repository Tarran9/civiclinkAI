import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { createBloodRequest } from "@/services/supabase";
import { generateBloodRequestAI } from "@/services/groq";
import { ROUTES } from "@/constants/routes";
import { BLOOD_GROUPS, BLOOD_URGENCY_LEVELS } from "@/constants";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Hospital,
  Wand2,
  Check,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { BloodGroup, BloodUrgency } from "@/types";

const schema = z.object({
  patientName: z.string().min(3, "Patient name must be at least 3 characters"),
  bloodGroup: z.string().min(1, "Please select a blood group"),
  unitsRequired: z.coerce.number().min(1, "Units required must be at least 1"),
  hospitalName: z.string().min(5, "Hospital name must be at least 5 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  phone: z.string().min(10, "Contact phone must be at least 10 digits"),
  urgency: z.string(),
  requiredBy: z.string().min(1, "Please select the date required by"),
  emergencyMessage: z.string().optional(),
  summary: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function BloodRequestNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    emergencyMessage: string;
    summary: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      patientName: "",
      bloodGroup: "",
      unitsRequired: 1,
      hospitalName: "",
      city: "",
      phone: "",
      urgency: "normal",
      requiredBy: new Date().toISOString().split("T")[0],
      emergencyMessage: "",
      summary: "",
    },
  });

  const selectedBloodGroup = watch("bloodGroup");
  const selectedUrgency = watch("urgency");

  const createMutation = useMutation({
    mutationFn: (vals: FormData) => {
      if (!user) throw new Error("User session not found.");
      return createBloodRequest({
        requester_id: user.id,
        patient_name: vals.patientName,
        blood_group: vals.bloodGroup as BloodGroup,
        units_required: vals.unitsRequired,
        hospital_name: vals.hospitalName,
        hospital_address: vals.city,
        contact_number: vals.phone,
        urgency: vals.urgency as BloodUrgency,
        status: "open",
        required_by: vals.requiredBy,
        notes: vals.emergencyMessage || aiResult?.emergencyMessage || `Urgent blood request for ${vals.patientName}.`,
        ai_summary: vals.summary || aiResult?.summary || `${vals.unitsRequired} units of ${vals.bloodGroup} blood required.`,
      });
    },
    onSuccess: () => {
      toast.success("Emergency blood request created and broadcasted!");
      queryClient.invalidateQueries({ queryKey: ["bloodRequests"] });
      navigate(ROUTES.CITIZEN.BLOOD_REQUESTS);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create blood request.");
    },
  });

  // Call Groq to generate broadcasts
  const handleGenerateBroadcast = async () => {
    const vals = getValues();
    if (!vals.patientName || !vals.bloodGroup || !vals.hospitalName) {
      toast.error("Please fill in patient name, blood group, and hospital first.");
      return;
    }

    setAiLoading(true);
    toast.info("Generating emergency broadcast text with AI...");

    try {
      const res = await generateBloodRequestAI({
        patientName: vals.patientName,
        bloodGroup: vals.bloodGroup,
        unitsRequired: vals.unitsRequired,
        hospitalName: vals.hospitalName,
        urgency: vals.urgency,
        requiredBy: vals.requiredBy,
      });

      setAiResult(res);
      toast.success("AI Emergency details generated! Click accept below.");
    } catch {
      // Mock Fallback
      setTimeout(() => {
        setAiResult({
          emergencyMessage: `🔴 URGENT BLOOD NEEDED: Patient ${vals.patientName} requires ${vals.unitsRequired} units of ${vals.bloodGroup} blood at ${vals.hospitalName}. Please contact immediately if you can donate.`,
          summary: `${vals.unitsRequired} units of ${vals.bloodGroup} blood required urgently at ${vals.hospitalName}.`,
        });
        toast.success("Simulated AI broadcast text generated. Preview below.");
      }, 1200);
    } finally {
      setAiLoading(false);
    }
  };

  const acceptAi = () => {
    if (aiResult) {
      setValue("emergencyMessage", aiResult.emergencyMessage);
      setValue("summary", aiResult.summary);
      setAiResult(null);
      toast.success("AI text applied!");
    }
  };

  const discardAi = () => {
    setAiResult(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
          <Heart className="w-8 h-8 text-rose-500" />
          Request Emergency Blood
        </h1>
        <p className="text-slate-500 dark:text-white/60 text-sm">
          Submit details for an emergency patient. Potential matches will be alerted immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
        <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display font-bold">Request Details</CardTitle>
            <CardDescription>All fields are required to verify the blood bank request.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Patient Name & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                  Patient Name
                </label>
                <Input
                  placeholder="e.g. John Doe"
                  {...register("patientName")}
                  className="rounded-xl border-slate-200 dark:border-white/10"
                />
                {errors.patientName && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.patientName.message}
                  </p>
                )}
              </div>

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
            </div>

            {/* Blood group & units */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                  Required Blood Group
                </label>
                <Select
                  value={selectedBloodGroup}
                  onValueChange={(val) => setValue("bloodGroup", val)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g} Group
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

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                  Units Required (Pints)
                </label>
                <Input
                  type="number"
                  min="1"
                  {...register("unitsRequired")}
                  className="rounded-xl border-slate-200 dark:border-white/10"
                />
                {errors.unitsRequired && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.unitsRequired.message}
                  </p>
                )}
              </div>
            </div>

            {/* Hospital & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1">
                  <Hospital className="w-4 h-4 text-slate-400" />
                  Hospital Name & Branch
                </label>
                <Input
                  placeholder="e.g. City General Hospital, Sector 5"
                  {...register("hospitalName")}
                  className="rounded-xl border-slate-200 dark:border-white/10"
                />
                {errors.hospitalName && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.hospitalName.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  City
                </label>
                <Input
                  placeholder="e.g. Bangalore"
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
            </div>

            {/* Required by & urgency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Required By (Date)
                </label>
                <Input
                  type="date"
                  {...register("requiredBy")}
                  className="rounded-xl border-slate-200 dark:border-white/10"
                />
                {errors.requiredBy && (
                  <p className="text-xs text-rose-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.requiredBy.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                  Urgency Level
                </label>
                <Select
                  value={selectedUrgency}
                  onValueChange={(val) => setValue("urgency", val)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Select Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_URGENCY_LEVELS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI Generator button */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateBroadcast}
                disabled={aiLoading}
                className="w-full rounded-xl border-rose-200 dark:border-rose-950 text-rose-600 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 gap-2 h-11"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                ) : (
                  <Wand2 className="w-4 h-4 text-rose-500" />
                )}
                Generate Emergency Broadcast details with AI
              </Button>
            </div>

            {/* AI result preview */}
            {aiResult && (
              <div className="border border-rose-100 dark:border-rose-950 bg-rose-50/20 dark:bg-rose-950/15 rounded-xl p-4 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  AI Suggested Emergency Broadcast text
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-slate-400">Broadcaster message:</span>
                    <p className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-3 rounded-lg text-slate-700 dark:text-white/80 font-medium leading-relaxed mt-1">
                      {aiResult.emergencyMessage}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Summary:</span>
                    <p className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-2 rounded-lg text-slate-700 dark:text-white/80 font-medium mt-1">
                      {aiResult.summary}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={discardAi} className="h-8 rounded-lg text-xs">
                    Discard
                  </Button>
                  <Button type="button" size="sm" onClick={acceptAi} className="bg-rose-600 hover:bg-rose-700 text-white h-8 rounded-lg text-xs gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Accept
                  </Button>
                </div>
              </div>
            )}

            {/* hidden form storage inputs in case user did not use AI */}
            <input type="hidden" {...register("emergencyMessage")} />
            <input type="hidden" {...register("summary")} />
          </CardContent>
          <CardFooter className="bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
            <Link to={ROUTES.CITIZEN.BLOOD_REQUESTS}>
              <Button type="button" variant="ghost" className="rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20 px-6"
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Broadcasting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
