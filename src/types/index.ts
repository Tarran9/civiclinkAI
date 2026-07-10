// Re-export all types from supabase for convenience
export type {
  Database,
  Json,
  UserRole,
  ComplaintCategory,
  ComplaintStatus,
  ComplaintPriority,
  BloodGroup,
  BloodUrgency,
  BloodRequestStatus,
  NoticeCategory,
  NotificationType,
} from "./supabase";

// ============================================================
// ROW TYPES (shorthand aliases from Database tables)
// ============================================================
import type { Database } from "./supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
export type ComplaintImage = Database["public"]["Tables"]["complaint_images"]["Row"];
export type BloodDonor = Database["public"]["Tables"]["blood_donors"]["Row"];
export type BloodRequest = Database["public"]["Tables"]["blood_requests"]["Row"];
export type CommunityNotice = Database["public"]["Tables"]["community_notices"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];

// Insert types
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ComplaintInsert = Database["public"]["Tables"]["complaints"]["Insert"];
export type ComplaintImageInsert = Database["public"]["Tables"]["complaint_images"]["Insert"];
export type BloodDonorInsert = Database["public"]["Tables"]["blood_donors"]["Insert"];
export type BloodRequestInsert = Database["public"]["Tables"]["blood_requests"]["Insert"];
export type CommunityNoticeInsert = Database["public"]["Tables"]["community_notices"]["Insert"];
export type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

// Update types
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ComplaintUpdate = Database["public"]["Tables"]["complaints"]["Update"];
export type BloodDonorUpdate = Database["public"]["Tables"]["blood_donors"]["Update"];
export type BloodRequestUpdate = Database["public"]["Tables"]["blood_requests"]["Update"];
export type CommunityNoticeUpdate = Database["public"]["Tables"]["community_notices"]["Update"];

// ============================================================
// APP-LEVEL TYPES
// ============================================================

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  totalDonors: number;
  openBloodRequests: number;
  totalNotices: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Complaint with joined profile
export interface ComplaintWithProfile extends Complaint {
  profiles?: Pick<Profile, "full_name" | "email" | "avatar_url">;
  complaint_images?: ComplaintImage[];
}

// Blood request with joined requester profile
export interface BloodRequestWithProfile extends BloodRequest {
  profiles?: Pick<Profile, "full_name" | "email" | "avatar_url">;
}

// Blood donor with joined profile
export interface BloodDonorWithProfile extends BloodDonor {
  profiles?: Pick<Profile, "full_name" | "email" | "avatar_url">;
}

// AI analysis types
export interface VisionAnalysis {
  category: string;
  confidence: number;
  description: string;
  severity: string;
  tags: string[];
}

export interface ComplaintAiAnalysis {
  improvedDescription: string;
  priority: string;
  department: string;
  reasoning: string;
}
