-- ============================================================
-- CIVICLINK AI — ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 002_rls_policies.sql
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

-- ============================================================
-- Enable RLS on all tables
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_notices  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs      ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- HELPER FUNCTION: check if current user is admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;


-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Users can view their own profile; admins can view all
CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

-- Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile (e.g. role changes)
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Profiles are inserted automatically via trigger — no manual insert
CREATE POLICY "profiles_insert_system"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());


-- ============================================================
-- COMPLAINTS POLICIES
-- ============================================================

-- Citizens see their own complaints; admins see all
CREATE POLICY "complaints_select"
  ON public.complaints FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

-- Any authenticated citizen can file a complaint
CREATE POLICY "complaints_insert"
  ON public.complaints FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Citizens update their OWN pending complaints only; admins update any
CREATE POLICY "complaints_update_citizen"
  ON public.complaints FOR UPDATE
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "complaints_update_admin"
  ON public.complaints FOR UPDATE
  USING (public.is_admin());

-- Citizens can delete their own pending complaints; admins can delete any
CREATE POLICY "complaints_delete_citizen"
  ON public.complaints FOR DELETE
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "complaints_delete_admin"
  ON public.complaints FOR DELETE
  USING (public.is_admin());


-- ============================================================
-- COMPLAINT IMAGES POLICIES
-- ============================================================

-- Images visible to complaint owner and admins
CREATE POLICY "complaint_images_select"
  ON public.complaint_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id AND (c.user_id = auth.uid() OR public.is_admin())
    )
  );

-- Only the complaint owner can insert images
CREATE POLICY "complaint_images_insert"
  ON public.complaint_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints c
      WHERE c.id = complaint_id AND c.user_id = auth.uid()
    )
  );

-- Only admins can update image records (AI vision analysis)
CREATE POLICY "complaint_images_update_admin"
  ON public.complaint_images FOR UPDATE
  USING (public.is_admin());


-- ============================================================
-- BLOOD DONORS POLICIES
-- ============================================================

-- Anyone authenticated can browse donors (needed for search)
CREATE POLICY "blood_donors_select"
  ON public.blood_donors FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only the user themselves can register as donor
CREATE POLICY "blood_donors_insert"
  ON public.blood_donors FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Donors update only their own record; admins update any
CREATE POLICY "blood_donors_update_own"
  ON public.blood_donors FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "blood_donors_update_admin"
  ON public.blood_donors FOR UPDATE
  USING (public.is_admin());

-- Admins only can delete donor records
CREATE POLICY "blood_donors_delete_admin"
  ON public.blood_donors FOR DELETE
  USING (public.is_admin());


-- ============================================================
-- BLOOD REQUESTS POLICIES
-- ============================================================

-- All authenticated users can view open requests; own requests always visible
CREATE POLICY "blood_requests_select"
  ON public.blood_requests FOR SELECT
  USING (requester_id = auth.uid() OR status = 'open' OR public.is_admin());

-- Any authenticated user can create a blood request
CREATE POLICY "blood_requests_insert"
  ON public.blood_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND requester_id = auth.uid());

-- Requester can update their own; admins can update any
CREATE POLICY "blood_requests_update_own"
  ON public.blood_requests FOR UPDATE
  USING (requester_id = auth.uid());

CREATE POLICY "blood_requests_update_admin"
  ON public.blood_requests FOR UPDATE
  USING (public.is_admin());

-- Requester can delete their own open requests; admins delete any
CREATE POLICY "blood_requests_delete_own"
  ON public.blood_requests FOR DELETE
  USING (requester_id = auth.uid() AND status = 'open');

CREATE POLICY "blood_requests_delete_admin"
  ON public.blood_requests FOR DELETE
  USING (public.is_admin());


-- ============================================================
-- COMMUNITY NOTICES POLICIES
-- ============================================================

-- All users can read published notices; admins read all
CREATE POLICY "notices_select_public"
  ON public.community_notices FOR SELECT
  USING (is_published = TRUE OR public.is_admin());

-- Only admins can create, update, or delete notices
CREATE POLICY "notices_insert_admin"
  ON public.community_notices FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "notices_update_admin"
  ON public.community_notices FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "notices_delete_admin"
  ON public.community_notices FOR DELETE
  USING (public.is_admin());


-- ============================================================
-- NOTIFICATIONS POLICIES
-- ============================================================

-- Users see their own notifications only
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- System/admins insert notifications (service role bypasses RLS)
CREATE POLICY "notifications_insert_admin"
  ON public.notifications FOR INSERT
  WITH CHECK (public.is_admin());

-- Users can only mark their own as read
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());


-- ============================================================
-- ACTIVITY LOGS POLICIES
-- ============================================================

-- Only admins can read activity logs
CREATE POLICY "activity_logs_select_admin"
  ON public.activity_logs FOR SELECT
  USING (public.is_admin());

-- Any authenticated action can insert a log (service role recommended)
CREATE POLICY "activity_logs_insert"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
