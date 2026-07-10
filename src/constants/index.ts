import type {
  ComplaintCategory,
  ComplaintStatus,
  ComplaintPriority,
  BloodGroup,
  BloodUrgency,
  BloodRequestStatus,
  NoticeCategory,
} from "@/types";

// ============================================================
// APP CONFIG
// ============================================================

export const APP_NAME = "CivicLink AI";
export const APP_TAGLINE = "AI Powered Community Assistance Platform";
export const APP_VERSION = "1.0.0";

// ============================================================
// PAGINATION
// ============================================================

export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ============================================================
// COMPLAINT CONSTANTS
// ============================================================

export const COMPLAINT_CATEGORIES: {
  value: ComplaintCategory;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: "garbage", label: "Garbage", icon: "trash-2", color: "bg-green-100 text-green-700" },
  { value: "pothole", label: "Pothole", icon: "circle-alert", color: "bg-orange-100 text-orange-700" },
  { value: "street_light", label: "Street Light", icon: "lamp", color: "bg-yellow-100 text-yellow-700" },
  { value: "water_leakage", label: "Water Leakage", icon: "droplets", color: "bg-blue-100 text-blue-700" },
  { value: "illegal_dumping", label: "Illegal Dumping", icon: "package-x", color: "bg-red-100 text-red-700" },
  { value: "drainage", label: "Drainage", icon: "waves", color: "bg-cyan-100 text-cyan-700" },
  { value: "tree_fallen", label: "Tree Fallen", icon: "tree-pine", color: "bg-emerald-100 text-emerald-700" },
  { value: "others", label: "Others", icon: "more-horizontal", color: "bg-slate-100 text-slate-700" },
];

export const COMPLAINT_STATUSES: {
  value: ComplaintStatus;
  label: string;
  className: string;
}[] = [
  { value: "pending", label: "Pending", className: "status-pending" },
  { value: "in_progress", label: "In Progress", className: "status-in-progress" },
  { value: "resolved", label: "Resolved", className: "status-resolved" },
  { value: "rejected", label: "Rejected", className: "status-rejected" },
];

export const COMPLAINT_PRIORITIES: {
  value: ComplaintPriority;
  label: string;
  className: string;
  order: number;
}[] = [
  { value: "low", label: "Low", className: "priority-low", order: 1 },
  { value: "medium", label: "Medium", className: "priority-medium", order: 2 },
  { value: "high", label: "High", className: "priority-high", order: 3 },
  { value: "critical", label: "Critical", className: "priority-critical", order: 4 },
];

export const DEPARTMENTS = [
  "Public Works Department",
  "Municipal Corporation",
  "Water Supply Department",
  "Electricity Department",
  "Road & Transport Department",
  "Sanitation Department",
  "Urban Development Authority",
  "Parks & Recreation Department",
];

// ============================================================
// BLOOD DONATION CONSTANTS
// ============================================================

export const BLOOD_GROUPS: BloodGroup[] = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

export const BLOOD_URGENCY_LEVELS: {
  value: BloodUrgency;
  label: string;
  className: string;
}[] = [
  { value: "normal", label: "Normal", className: "bg-slate-100 text-slate-700" },
  { value: "urgent", label: "Urgent", className: "bg-amber-100 text-amber-700" },
  { value: "critical", label: "Critical", className: "bg-rose-100 text-rose-700" },
];

export const BLOOD_REQUEST_STATUSES: {
  value: BloodRequestStatus;
  label: string;
  className: string;
}[] = [
  { value: "open", label: "Open", className: "bg-blue-100 text-blue-700" },
  { value: "fulfilled", label: "Fulfilled", className: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "Cancelled", className: "bg-slate-100 text-slate-700" },
  { value: "expired", label: "Expired", className: "bg-rose-100 text-rose-700" },
];

// ============================================================
// NOTICE CONSTANTS
// ============================================================

export const NOTICE_CATEGORIES: {
  value: NoticeCategory;
  label: string;
  color: string;
}[] = [
  { value: "general", label: "General", color: "bg-slate-100 text-slate-700" },
  { value: "emergency", label: "Emergency", color: "bg-rose-100 text-rose-700" },
  { value: "event", label: "Event", color: "bg-purple-100 text-purple-700" },
  { value: "maintenance", label: "Maintenance", color: "bg-amber-100 text-amber-700" },
  { value: "health", label: "Health", color: "bg-emerald-100 text-emerald-700" },
  { value: "safety", label: "Safety", color: "bg-orange-100 text-orange-700" },
];

// ============================================================
// FILE UPLOAD
// ============================================================

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGES_PER_COMPLAINT = 5;

// ============================================================
// QUERY KEYS
// ============================================================

export const QUERY_KEYS = {
  profile: (id: string) => ["profile", id],
  profiles: ["profiles"],
  complaints: ["complaints"],
  complaint: (id: string) => ["complaint", id],
  complaintImages: (id: string) => ["complaint-images", id],
  bloodDonors: ["blood-donors"],
  bloodDonor: (id: string) => ["blood-donor", id],
  bloodRequests: ["blood-requests"],
  bloodRequest: (id: string) => ["blood-request", id],
  notices: ["notices"],
  notice: (id: string) => ["notice", id],
  notifications: (userId: string) => ["notifications", userId],
  dashboardStats: ["dashboard-stats"],
  activityLogs: ["activity-logs"],
} as const;
