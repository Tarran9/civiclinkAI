-- ============================================================
-- CIVICLINK AI — SUPABASE INITIAL SCHEMA
-- Migration: 001_initial_schema.sql
-- Run this first in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('citizen', 'admin');

CREATE TYPE complaint_category AS ENUM (
  'garbage',
  'pothole',
  'street_light',
  'water_leakage',
  'illegal_dumping',
  'drainage',
  'tree_fallen',
  'others'
);

CREATE TYPE complaint_status AS ENUM (
  'pending',
  'in_progress',
  'resolved',
  'rejected'
);

CREATE TYPE complaint_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE blood_group AS ENUM (
  'A+', 'A-',
  'B+', 'B-',
  'AB+', 'AB-',
  'O+', 'O-'
);

CREATE TYPE blood_urgency AS ENUM (
  'normal',
  'urgent',
  'critical'
);

CREATE TYPE blood_request_status AS ENUM (
  'open',
  'fulfilled',
  'cancelled',
  'expired'
);

CREATE TYPE notice_category AS ENUM (
  'general',
  'emergency',
  'event',
  'maintenance',
  'health',
  'safety'
);

CREATE TYPE notification_type AS ENUM (
  'complaint_update',
  'blood_request',
  'notice_published',
  'system',
  'welcome'
);


-- ============================================================
-- TABLE: profiles
-- Extends Supabase auth.users with app-specific fields.
-- Auto-populated via trigger when a new user signs up.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  avatar_url   TEXT,
  phone        TEXT,
  address      TEXT,
  role         user_role NOT NULL DEFAULT 'citizen',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast role-based lookups
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);


-- ============================================================
-- TABLE: complaints
-- Core civic complaint submissions by citizens.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.complaints (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  category            complaint_category NOT NULL,
  status              complaint_status NOT NULL DEFAULT 'pending',
  priority            complaint_priority NOT NULL DEFAULT 'medium',
  location            TEXT,
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  assigned_department TEXT,
  ai_analysis         JSONB,
  admin_notes         TEXT,
  resolved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaints_user_id   ON public.complaints(user_id);
CREATE INDEX idx_complaints_status    ON public.complaints(status);
CREATE INDEX idx_complaints_category  ON public.complaints(category);
CREATE INDEX idx_complaints_priority  ON public.complaints(priority);
CREATE INDEX idx_complaints_created   ON public.complaints(created_at DESC);


-- ============================================================
-- TABLE: complaint_images
-- Evidence images uploaded alongside a complaint.
-- Files stored in Supabase Storage bucket: "complaint-images"
-- ============================================================

CREATE TABLE IF NOT EXISTS public.complaint_images (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_id        UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  storage_path        TEXT NOT NULL,           -- path inside the Storage bucket
  public_url          TEXT NOT NULL,           -- publicly accessible CDN URL
  file_name           TEXT NOT NULL,
  file_size           INTEGER NOT NULL,        -- bytes
  mime_type           TEXT NOT NULL,
  ai_vision_analysis  JSONB,                  -- Gemini/GPT vision output
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaint_images_complaint_id ON public.complaint_images(complaint_id);


-- ============================================================
-- TABLE: blood_donors
-- Citizens who have registered as blood donors.
-- One record per user (enforced via UNIQUE user_id).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blood_donors (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_group         blood_group NOT NULL,
  is_available        BOOLEAN NOT NULL DEFAULT TRUE,
  last_donation_date  DATE,
  medical_conditions  TEXT,
  city                TEXT NOT NULL,
  state               TEXT NOT NULL,
  contact_number      TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blood_donors_blood_group  ON public.blood_donors(blood_group);
CREATE INDEX idx_blood_donors_city         ON public.blood_donors(city);
CREATE INDEX idx_blood_donors_available    ON public.blood_donors(is_available);


-- ============================================================
-- TABLE: blood_requests
-- Emergency blood requests posted by citizens.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.blood_requests (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name     TEXT NOT NULL,
  blood_group      blood_group NOT NULL,
  units_required   INTEGER NOT NULL CHECK (units_required > 0),
  hospital_name    TEXT NOT NULL,
  hospital_address TEXT NOT NULL,
  contact_number   TEXT NOT NULL,
  urgency          blood_urgency NOT NULL DEFAULT 'normal',
  status           blood_request_status NOT NULL DEFAULT 'open',
  ai_summary       TEXT,
  notes            TEXT,
  required_by      DATE NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blood_requests_requester    ON public.blood_requests(requester_id);
CREATE INDEX idx_blood_requests_blood_group  ON public.blood_requests(blood_group);
CREATE INDEX idx_blood_requests_status       ON public.blood_requests(status);
CREATE INDEX idx_blood_requests_urgency      ON public.blood_requests(urgency);


-- ============================================================
-- TABLE: community_notices
-- Official announcements published by admins.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.community_notices (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  category     notice_category NOT NULL DEFAULT 'general',
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_pinned    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notices_author      ON public.community_notices(author_id);
CREATE INDEX idx_notices_published   ON public.community_notices(is_published);
CREATE INDEX idx_notices_pinned      ON public.community_notices(is_pinned DESC);
CREATE INDEX idx_notices_category    ON public.community_notices(category);


-- ============================================================
-- TABLE: notifications
-- In-app notifications sent to individual users.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  type            notification_type NOT NULL DEFAULT 'system',
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  reference_id    UUID,           -- e.g. complaint_id or blood_request_id
  reference_type  TEXT,           -- 'complaint' | 'blood_request' | 'notice'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id  ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read  ON public.notifications(is_read);
CREATE INDEX idx_notifications_created  ON public.notifications(created_at DESC);


-- ============================================================
-- TABLE: activity_logs
-- Audit trail for all significant user/admin actions.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,        -- e.g. 'complaint.created', 'user.role_changed'
  entity_type  TEXT NOT NULL,        -- 'complaint' | 'profile' | 'notice' | etc.
  entity_id    UUID,
  metadata     JSONB,
  ip_address   INET,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id  ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action   ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_entity   ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_created  ON public.activity_logs(created_at DESC);
