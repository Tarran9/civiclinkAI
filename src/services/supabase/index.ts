import { supabase as realSupabase } from "@/lib/supabase";
const supabase = realSupabase as any;
import type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
  ComplaintWithProfile,
  ComplaintInsert,
  ComplaintUpdate,
  BloodDonorWithProfile,
  BloodDonorInsert,
  BloodDonorUpdate,
  BloodRequestWithProfile,
  BloodRequestInsert,
  BloodRequestUpdate,
  CommunityNotice,
  CommunityNoticeInsert,
  CommunityNoticeUpdate,
  Notification,
  ActivityLog,
  DashboardStats,
  ComplaintStatus,
  ComplaintCategory,
  BloodGroup,
  BloodRequestStatus,
} from "@/types";
import { DEFAULT_PAGE_SIZE } from "@/constants";

// ============================================================
// PROFILES
// ============================================================

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllProfiles(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  search?: string
) {
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0 };
}

// ============================================================
// COMPLAINTS
// ============================================================

export async function getComplaints(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  filters?: {
    status?: ComplaintStatus;
    category?: ComplaintCategory;
    userId?: string;
    search?: string;
  }
) {
  let query = supabase
    .from("complaints")
    .select("*, profiles(full_name, email, avatar_url), complaint_images(*)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.userId) query = query.eq("user_id", filters.userId);
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data as ComplaintWithProfile[]) ?? [], total: count ?? 0 };
}

export async function getComplaintById(id: string): Promise<ComplaintWithProfile> {
  const { data, error } = await supabase
    .from("complaints")
    .select("*, profiles(full_name, email, avatar_url), complaint_images(*)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as ComplaintWithProfile;
}

export async function createComplaint(complaint: ComplaintInsert): Promise<ComplaintWithProfile> {
  const { data, error } = await supabase
    .from("complaints")
    .insert(complaint)
    .select("*, profiles(full_name, email, avatar_url)")
    .single();
  if (error) throw error;
  return data as ComplaintWithProfile;
}

export async function updateComplaint(
  id: string,
  updates: ComplaintUpdate
): Promise<ComplaintWithProfile> {
  const { data, error } = await supabase
    .from("complaints")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, profiles(full_name, email, avatar_url)")
    .single();
  if (error) throw error;
  return data as ComplaintWithProfile;
}

export async function deleteComplaint(id: string): Promise<void> {
  const { error } = await supabase.from("complaints").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// BLOOD DONORS
// ============================================================

export async function getBloodDonors(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  filters?: { bloodGroup?: BloodGroup; city?: string; isAvailable?: boolean }
) {
  let query = supabase
    .from("blood_donors")
    .select("*, profiles(full_name, email, avatar_url)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters?.bloodGroup) query = query.eq("blood_group", filters.bloodGroup);
  if (filters?.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters?.isAvailable !== undefined)
    query = query.eq("is_available", filters.isAvailable);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data as BloodDonorWithProfile[]) ?? [], total: count ?? 0 };
}

export async function getBloodDonorByUserId(userId: string): Promise<BloodDonorWithProfile | null> {
  const { data, error } = await supabase
    .from("blood_donors")
    .select("*, profiles(full_name, email, avatar_url)")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as BloodDonorWithProfile | null;
}

export async function upsertBloodDonor(donor: BloodDonorInsert): Promise<BloodDonorWithProfile> {
  const { data, error } = await supabase
    .from("blood_donors")
    .upsert({ ...donor, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
    .select("*, profiles(full_name, email, avatar_url)")
    .single();
  if (error) throw error;
  return data as BloodDonorWithProfile;
}

export async function updateBloodDonor(
  id: string,
  updates: BloodDonorUpdate
): Promise<BloodDonorWithProfile> {
  const { data, error } = await supabase
    .from("blood_donors")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, profiles(full_name, email, avatar_url)")
    .single();
  if (error) throw error;
  return data as BloodDonorWithProfile;
}

// ============================================================
// BLOOD REQUESTS
// ============================================================

export async function getBloodRequests(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  filters?: {
    bloodGroup?: BloodGroup;
    status?: BloodRequestStatus;
    userId?: string;
  }
) {
  let query = supabase
    .from("blood_requests")
    .select("*, profiles(full_name, email, avatar_url)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters?.bloodGroup) query = query.eq("blood_group", filters.bloodGroup);
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.userId) query = query.eq("requester_id", filters.userId);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data as BloodRequestWithProfile[]) ?? [], total: count ?? 0 };
}

export async function createBloodRequest(request: BloodRequestInsert): Promise<BloodRequestWithProfile> {
  const { data, error } = await supabase
    .from("blood_requests")
    .insert(request)
    .select("*, profiles(full_name, email, avatar_url)")
    .single();
  if (error) throw error;
  return data as BloodRequestWithProfile;
}

export async function updateBloodRequest(
  id: string,
  updates: BloodRequestUpdate
): Promise<BloodRequestWithProfile> {
  const { data, error } = await supabase
    .from("blood_requests")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, profiles(full_name, email, avatar_url)")
    .single();
  if (error) throw error;
  return data as BloodRequestWithProfile;
}

export async function deleteBloodRequest(id: string): Promise<void> {
  const { error } = await supabase.from("blood_requests").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// COMMUNITY NOTICES
// ============================================================

export async function getNotices(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  filters?: { isPublished?: boolean; search?: string }
) {
  let query = supabase
    .from("community_notices")
    .select("*", { count: "exact" })
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (filters?.isPublished !== undefined)
    query = query.eq("is_published", filters.isPublished);
  if (filters?.search)
    query = query.or(
      `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
    );

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data as CommunityNotice[]) ?? [], total: count ?? 0 };
}

export async function getNoticeById(id: string): Promise<CommunityNotice> {
  const { data, error } = await supabase
    .from("community_notices")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createNotice(notice: CommunityNoticeInsert): Promise<CommunityNotice> {
  const { data, error } = await supabase
    .from("community_notices")
    .insert(notice)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateNotice(
  id: string,
  updates: CommunityNoticeUpdate
): Promise<CommunityNotice> {
  const { data, error } = await supabase
    .from("community_notices")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNotice(id: string): Promise<void> {
  const { error } = await supabase.from("community_notices").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw error;
}

// ============================================================
// ACTIVITY LOGS
// ============================================================

export async function logActivity(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { error } = await supabase.from("activity_logs").insert({
    user_id: params.userId ?? null,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    metadata: params.metadata ?? null,
  });
  // Silently fail — activity logging should never break the main flow
  if (error) console.warn("Activity log failed:", error.message);
}

export async function getActivityLogs(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<{ data: ActivityLog[]; total: number }> {
  const { data, error, count } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw error;
  return { data: data ?? [], total: count ?? 0 };
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    { count: totalUsers },
    { count: totalComplaints },
    { count: resolvedComplaints },
    { count: pendingComplaints },
    { count: totalDonors },
    { count: openBloodRequests },
    { count: totalNotices },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("complaints").select("*", { count: "exact", head: true }),
    supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved"),
    supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("blood_donors").select("*", { count: "exact", head: true }),
    supabase
      .from("blood_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase.from("community_notices").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    totalComplaints: totalComplaints ?? 0,
    resolvedComplaints: resolvedComplaints ?? 0,
    pendingComplaints: pendingComplaints ?? 0,
    totalDonors: totalDonors ?? 0,
    openBloodRequests: openBloodRequests ?? 0,
    totalNotices: totalNotices ?? 0,
  };
}
