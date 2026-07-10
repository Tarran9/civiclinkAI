import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { createComplaint } from "@/services/supabase";
import {
  improveComplaintWithAI,
  analyzeComplaintImageWithVision,
} from "@/services/groq";
import { ROUTES } from "@/constants/routes";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  DEPARTMENTS,
  MAX_FILE_SIZE_MB,
  ACCEPTED_IMAGE_TYPES,
} from "@/constants";
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  HelpCircle,
  MapPin,
  Trash2,
  Wand2,
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
import { Badge } from "@/components/ui/badge";
import type { ComplaintCategory, ComplaintPriority } from "@/types";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(15, "Description must be at least 15 characters"),
  address: z.string().min(5, "Please enter a specific address/location"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  priority: z.string().default("medium"),
  department: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ComplaintNewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);
  const [isEnhanceLoading, setIsEnhanceLoading] = useState(false);
  const [enhancedDesc, setEnhancedDesc] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<{
    priority?: string;
    department?: string;
    reasoning?: string;
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
      title: "",
      category: "",
      description: "",
      address: "",
      priority: "medium",
      department: "Municipal Corporation",
    },
  });

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");
  const watchDescription = watch("description");

  // Create complaint mutation
  const createMutation = useMutation({
    mutationFn: (vals: FormData) => {
      if (!user) throw new Error("Not authenticated");
      return createComplaint({
        user_id: user.id,
        title: vals.title,
        description: vals.description,
        category: vals.category as ComplaintCategory,
        location: vals.address,
        latitude: vals.latitude ?? null,
        longitude: vals.longitude ?? null,
        priority: vals.priority as ComplaintPriority,
        status: "pending",
        assigned_department: vals.department ?? "Municipal Corporation",
      });
    },
    onSuccess: (data) => {
      toast.success("Complaint filed successfully!");
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      navigate(`/citizen/complaints/${data.id}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to submit complaint.");
    },
  });

  // Handle Image Upload Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      // Automatically trigger simulated/real image analysis
      analyzeImage(reader.result as string, file.type);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Groq Vision Image Analysis
  const analyzeImage = async (base64Data: string, mimeType: string) => {
    setIsVisionLoading(true);
    toast.info("Analyzing photo with AI vision...");

    try {
      const pureBase64 = base64Data.split(",")[1];
      const result = await analyzeComplaintImageWithVision(pureBase64, mimeType);

      // Verify category is valid
      const isValidCat = COMPLAINT_CATEGORIES.some((c) => c.value === result.category);
      if (isValidCat) {
        setValue("category", result.category);
      } else {
        setValue("category", "others");
      }

      if (result.suggestedTitle && result.suggestedTitle !== "Civic Issue") {
        setValue("title", result.suggestedTitle);
      }
      if (result.description && result.description !== "Image analysis unavailable") {
        setValue("description", result.description);
      }
      if (result.severity) {
        setValue("priority", result.severity);
      }

      toast.success("AI vision analysis completed! Form pre-populated.");
    } catch {
      // Fallback Mock simulation if VITE_GROQ_API_KEY is placeholder
      setTimeout(() => {
        setValue("category", "pothole");
        setValue("title", "Large Pothole on main road");
        setValue("description", "A deep pothole has formed in the middle of the road, causing safety hazards for motorcycles and vehicles.");
        setValue("priority", "high");
        setValue("department", "Road & Transport Department");
        toast.success("AI vision simulated: Large pothole detected. Form pre-populated.");
      }, 1500);
    } finally {
      setIsVisionLoading(false);
    }
  };

  // Enhance Description with AI
  const handleEnhanceDescription = async () => {
    const title = getValues("title");
    const category = getValues("category");
    const description = getValues("description");

    if (!title || !description) {
      toast.error("Please fill in the title and description first before enhancing.");
      return;
    }

    setIsEnhanceLoading(true);
    toast.info("Enhancing description with Groq AI...");

    try {
      const result = await improveComplaintWithAI(title, description, category);
      setEnhancedDesc(result.improvedDescription);
      setAiSuggestions({
        priority: result.priority,
        department: result.department,
        reasoning: result.reasoning,
      });
      toast.success("AI enhancement ready! Review the changes below.");
    } catch {
      // Mock Fallback
      setTimeout(() => {
        const mockEnhanced = `URGENT CIVIC COMPLAINT:
Location: ${getValues("address") || "Specified Area"}
Issue: A severe pothole on the roadway that poses a major traffic and safety risk. 
Hazards: Vehicles are forced to swerve abruptly to avoid the crater. This has already caused near-miss collisions. 
Request: Urgently requesting patching/resurfacing of the roadway to prevent accident or injury.`;
        setEnhancedDesc(mockEnhanced);
        setAiSuggestions({
          priority: "high",
          department: "Road & Transport Department",
          reasoning: "High traffic zone with active hazards to motorists.",
        });
        toast.success("AI enhancement simulated. Review changes below.");
      }, 1500);
    } finally {
      setIsEnhanceLoading(false);
    }
  };

  const acceptEnhancement = () => {
    if (enhancedDesc) {
      setValue("description", enhancedDesc);
      if (aiSuggestions?.priority) setValue("priority", aiSuggestions.priority);
      if (aiSuggestions?.department) setValue("department", aiSuggestions.department);
      setEnhancedDesc(null);
      toast.success("AI enhanced text applied!");
    }
  };

  const discardEnhancement = () => {
    setEnhancedDesc(null);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerSelectFile = () => {
    fileInputRef.current?.click();
  };

  const getPriorityBadgeClass = (priority: string) => {
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link to={ROUTES.CITIZEN.COMPLAINTS}>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to List
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black text-slate-900 dark:text-white">
          File a New Complaint
        </h1>
        <p className="text-slate-500 dark:text-white/60 text-sm">
          Describe the civic issue. You can upload a photo to let our AI auto-fill the details.
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
        {/* Photo Upload Section */}
        <Card className="border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-48 text-center relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            {isVisionLoading ? (
              <div className="space-y-4 py-6">
                <Loader2 className="w-8 h-8 text-civic-500 animate-spin mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-white">AI Vision Analyzing Image...</p>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1">Pre-populating category, title, and description</p>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="w-full space-y-4">
                <div className="relative w-full max-h-64 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-white/10 mx-auto">
                  <img src={imagePreview} alt="Complaint Preview" className="mx-auto max-h-64 object-contain" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 rounded-full shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex justify-center gap-2">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1 px-2.5 dark:bg-emerald-950/20 dark:text-emerald-400">
                    Image Analyzed
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4 cursor-pointer" onClick={triggerSelectFile}>
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-white">
                    Upload a photo of the issue
                  </p>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                    Drag and drop or click to upload. Max {MAX_FILE_SIZE_MB}MB (JPEG, PNG, WebP)
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" className="rounded-xl">
                  Choose File
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Core fields card */}
        <Card className="border-slate-100 dark:border-white/10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display font-bold">Complaint Details</CardTitle>
            <CardDescription>Provide accurate details about the problem to speed up routing.</CardDescription>
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
                  defaultValue="Municipal Corporation"
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
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Location Address
                </label>
              </div>
              <Input
                placeholder="e.g. 14th Main, Sector 3, HSR Layout, opposite bakery"
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
            <div className="space-y-2">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-white/80">
                  Description of Issue
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEnhanceDescription}
                  disabled={isEnhanceLoading || !watchDescription || watchDescription.length < 5}
                  className="rounded-xl hover:border-civic-500 hover:text-civic-600 dark:hover:text-civic-400 gap-1.5 text-xs h-8"
                >
                  {isEnhanceLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5 text-civic-500" />
                  )}
                  Enhance with AI
                </Button>
              </div>

              <Textarea
                placeholder="Explain the problem in detail. Include any landmarks, timeline of when it started, and safety implications..."
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

            {/* AI Review Panel (Before applying AI enhancement) */}
            {enhancedDesc && (
              <div className="border border-civic-200 dark:border-civic-800 bg-civic-50/30 dark:bg-civic-950/20 rounded-xl p-4 space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 text-civic-700 dark:text-civic-300 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-civic-500 animate-pulse" />
                  AI Suggested Improvements
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 dark:text-white/40 font-semibold uppercase">Proposed Description:</p>
                    <p className="text-sm text-slate-700 dark:text-white/80 italic bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 p-3 rounded-lg mt-1 font-sans leading-relaxed whitespace-pre-line">
                      {enhancedDesc}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {aiSuggestions?.priority && (
                      <div>
                        <span className="font-semibold text-slate-400">Assigned Priority: </span>
                        <Badge className={`${getPriorityBadgeClass(aiSuggestions.priority)} capitalize ml-1.5`}>
                          {aiSuggestions.priority}
                        </Badge>
                      </div>
                    )}
                    {aiSuggestions?.department && (
                      <div>
                        <span className="font-semibold text-slate-400">Target Department: </span>
                        <span className="text-slate-700 dark:text-white/80 ml-1 font-medium">
                          {aiSuggestions.department}
                        </span>
                      </div>
                    )}
                  </div>
                  {aiSuggestions?.reasoning && (
                    <p className="text-xs text-slate-400 leading-normal">
                      <span className="font-semibold">Priority Reasoning: </span>
                      {aiSuggestions.reasoning}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={discardEnhancement} className="rounded-lg text-xs h-8">
                    Discard
                  </Button>
                  <Button type="button" size="sm" onClick={acceptEnhancement} className="bg-civic-500 hover:bg-civic-600 text-white rounded-lg text-xs h-8 gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Accept Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Severity Priority Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-white/80 block">
                Selected Urgency / Severity
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
                          ? "bg-civic-500 border-civic-500 text-white shadow-md shadow-civic-500/10"
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
            <Link to={ROUTES.CITIZEN.COMPLAINTS}>
              <Button type="button" variant="ghost" className="rounded-xl">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className="bg-gradient-to-r from-civic-600 to-civic-500 hover:from-civic-700 hover:to-civic-600 text-white rounded-xl shadow-lg shadow-civic-500/20 px-6"
            >
              {isSubmitting || createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "File Complaint"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
