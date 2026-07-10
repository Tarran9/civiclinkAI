import { z } from "zod";
import {
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGES_PER_COMPLAINT,
} from "@/constants";

// ============================================================
// COMMON SCHEMAS
// ============================================================

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .regex(/^[\d\s\+\-\(\)]+$/, "Invalid phone number format");

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: emailSchema,
    password: passwordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
    phone: phoneSchema.optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// ============================================================
// PROFILE SCHEMA
// ============================================================

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: phoneSchema.optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
});

// ============================================================
// COMPLAINT SCHEMAS
// ============================================================

export const complaintSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(2000, "Description must be under 2000 characters"),
  category: z.enum([
    "garbage",
    "pothole",
    "street_light",
    "water_leakage",
    "illegal_dumping",
    "drainage",
    "tree_fallen",
    "others",
  ]),
  location: z.string().max(500).optional().or(z.literal("")),
});

export const imageUploadSchema = z.object({
  files: z
    .custom<FileList>()
    .refine(
      (files) => !files || files.length <= MAX_IMAGES_PER_COMPLAINT,
      `Maximum ${MAX_IMAGES_PER_COMPLAINT} images allowed`
    )
    .refine(
      (files) =>
        !files ||
        Array.from(files).every((file) => file.size <= MAX_FILE_SIZE_BYTES),
      "Each image must be under 5MB"
    )
    .refine(
      (files) =>
        !files ||
        Array.from(files).every((file) =>
          ACCEPTED_IMAGE_TYPES.includes(file.type)
        ),
      "Only JPG, PNG, and WebP images are allowed"
    ),
});

// ============================================================
// BLOOD DONATION SCHEMAS
// ============================================================

export const bloodDonorSchema = z.object({
  blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  contact_number: phoneSchema,
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State is required").max(100),
  last_donation_date: z.string().optional().or(z.literal("")),
  medical_conditions: z.string().max(500).optional().or(z.literal("")),
  is_available: z.boolean().default(true),
});

export const bloodRequestSchema = z.object({
  patient_name: z.string().min(2, "Patient name is required").max(200),
  blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  units_required: z.coerce
    .number()
    .int()
    .min(1, "At least 1 unit required")
    .max(20, "Cannot exceed 20 units"),
  hospital_name: z.string().min(3, "Hospital name is required").max(300),
  hospital_address: z.string().min(10, "Hospital address is required").max(500),
  contact_number: phoneSchema,
  urgency: z.enum(["normal", "urgent", "critical"]),
  required_by: z.string().min(1, "Required date is required"),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

// ============================================================
// NOTICE SCHEMAS
// ============================================================

export const noticeSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(300),
  content: z.string().min(20, "Content must be at least 20 characters").max(5000),
  category: z.enum(["general", "emergency", "event", "maintenance", "health", "safety"]),
  is_pinned: z.boolean().default(false),
  expires_at: z.string().optional().or(z.literal("")),
});

// ============================================================
// TYPE INFERENCE
// ============================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;
export type BloodDonorInput = z.infer<typeof bloodDonorSchema>;
export type BloodRequestInput = z.infer<typeof bloodRequestSchema>;
export type NoticeInput = z.infer<typeof noticeSchema>;
