// ============================================================
// DATABASE TYPES (generated from Supabase schema)
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          address: string | null;
          role: "citizen" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: "citizen" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          role?: "citizen" | "admin";
          updated_at?: string;
        };
      };
      complaints: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          category: ComplaintCategory;
          status: ComplaintStatus;
          priority: ComplaintPriority;
          location: string | null;
          latitude: number | null;
          longitude: number | null;
          assigned_department: string | null;
          ai_analysis: Json | null;
          admin_notes: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          category: ComplaintCategory;
          status?: ComplaintStatus;
          priority?: ComplaintPriority;
          location?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          assigned_department?: string | null;
          ai_analysis?: Json | null;
          admin_notes?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category?: ComplaintCategory;
          status?: ComplaintStatus;
          priority?: ComplaintPriority;
          location?: string | null;
          assigned_department?: string | null;
          ai_analysis?: Json | null;
          admin_notes?: string | null;
          resolved_at?: string | null;
          updated_at?: string;
        };
      };
      complaint_images: {
        Row: {
          id: string;
          complaint_id: string;
          storage_path: string;
          public_url: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          ai_vision_analysis: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          complaint_id: string;
          storage_path: string;
          public_url: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          ai_vision_analysis?: Json | null;
          created_at?: string;
        };
        Update: {
          ai_vision_analysis?: Json | null;
        };
      };
      blood_donors: {
        Row: {
          id: string;
          user_id: string;
          blood_group: BloodGroup;
          is_available: boolean;
          last_donation_date: string | null;
          medical_conditions: string | null;
          city: string;
          state: string;
          contact_number: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          blood_group: BloodGroup;
          is_available?: boolean;
          last_donation_date?: string | null;
          medical_conditions?: string | null;
          city: string;
          state: string;
          contact_number: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          blood_group?: BloodGroup;
          is_available?: boolean;
          last_donation_date?: string | null;
          medical_conditions?: string | null;
          city?: string;
          state?: string;
          contact_number?: string;
          updated_at?: string;
        };
      };
      blood_requests: {
        Row: {
          id: string;
          requester_id: string;
          patient_name: string;
          blood_group: BloodGroup;
          units_required: number;
          hospital_name: string;
          hospital_address: string;
          contact_number: string;
          urgency: BloodUrgency;
          status: BloodRequestStatus;
          ai_summary: string | null;
          notes: string | null;
          required_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          patient_name: string;
          blood_group: BloodGroup;
          units_required: number;
          hospital_name: string;
          hospital_address: string;
          contact_number: string;
          urgency: BloodUrgency;
          status?: BloodRequestStatus;
          ai_summary?: string | null;
          notes?: string | null;
          required_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          patient_name?: string;
          blood_group?: BloodGroup;
          units_required?: number;
          hospital_name?: string;
          hospital_address?: string;
          contact_number?: string;
          urgency?: BloodUrgency;
          status?: BloodRequestStatus;
          ai_summary?: string | null;
          notes?: string | null;
          required_by?: string;
          updated_at?: string;
        };
      };
      community_notices: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          content: string;
          category: NoticeCategory;
          is_published: boolean;
          is_pinned: boolean;
          published_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          content: string;
          category: NoticeCategory;
          is_published?: boolean;
          is_pinned?: boolean;
          published_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          content?: string;
          category?: NoticeCategory;
          is_published?: boolean;
          is_pinned?: boolean;
          published_at?: string | null;
          expires_at?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: NotificationType;
          is_read: boolean;
          reference_id: string | null;
          reference_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: NotificationType;
          is_read?: boolean;
          reference_id?: string | null;
          reference_type?: string | null;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ============================================================
// DOMAIN ENUMS
// ============================================================

export type UserRole = "citizen" | "admin";

export type ComplaintCategory =
  | "garbage"
  | "pothole"
  | "street_light"
  | "water_leakage"
  | "illegal_dumping"
  | "drainage"
  | "tree_fallen"
  | "others";

export type ComplaintStatus =
  | "pending"
  | "in_progress"
  | "resolved"
  | "rejected";

export type ComplaintPriority = "low" | "medium" | "high" | "critical";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type BloodUrgency = "normal" | "urgent" | "critical";

export type BloodRequestStatus =
  | "open"
  | "fulfilled"
  | "cancelled"
  | "expired";

export type NoticeCategory =
  | "general"
  | "emergency"
  | "event"
  | "maintenance"
  | "health"
  | "safety";

export type NotificationType =
  | "complaint_update"
  | "blood_request"
  | "notice_published"
  | "system"
  | "welcome";
