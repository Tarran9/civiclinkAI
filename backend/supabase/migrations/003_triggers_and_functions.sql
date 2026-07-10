-- ============================================================
-- CIVICLINK AI — DATABASE TRIGGERS & FUNCTIONS
-- Migration: 003_triggers_and_functions.sql
-- Run this AFTER 002_rls_policies.sql
-- ============================================================


-- ============================================================
-- TRIGGER 1: Auto-create profile when user signs up
-- Fires after INSERT on auth.users
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    'citizen'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- TRIGGER 2: Auto-update `updated_at` on complaints
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER complaints_set_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER blood_donors_set_updated_at
  BEFORE UPDATE ON public.blood_donors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER blood_requests_set_updated_at
  BEFORE UPDATE ON public.blood_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER community_notices_set_updated_at
  BEFORE UPDATE ON public.community_notices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- TRIGGER 3: Auto-set resolved_at when complaint is resolved
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_complaint_resolved()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status <> 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  IF NEW.status <> 'resolved' THEN
    NEW.resolved_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_complaint_status_change
  BEFORE UPDATE OF status ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.handle_complaint_resolved();


-- ============================================================
-- TRIGGER 4: Auto-notify citizen when complaint status changes
-- ============================================================

CREATE OR REPLACE FUNCTION public.notify_complaint_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_title   TEXT;
  v_message TEXT;
BEGIN
  -- Only fire when status actually changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  v_title := 'Complaint Status Updated';

  CASE NEW.status
    WHEN 'in_progress' THEN
      v_message := 'Your complaint "' || NEW.title || '" is now being investigated by the department.';
    WHEN 'resolved' THEN
      v_message := 'Great news! Your complaint "' || NEW.title || '" has been resolved.';
    WHEN 'rejected' THEN
      v_message := 'Your complaint "' || NEW.title || '" was reviewed and could not be processed at this time.';
    ELSE
      RETURN NEW;
  END CASE;

  INSERT INTO public.notifications (user_id, title, message, type, reference_id, reference_type)
  VALUES (NEW.user_id, v_title, v_message, 'complaint_update', NEW.id, 'complaint');

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_complaint_status_notify
  AFTER UPDATE OF status ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.notify_complaint_status_change();


-- ============================================================
-- TRIGGER 5: Auto-set published_at when notice is published
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_notice_published()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_published = TRUE AND (OLD.is_published = FALSE OR OLD.published_at IS NULL) THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_notice_publish
  BEFORE UPDATE OF is_published ON public.community_notices
  FOR EACH ROW EXECUTE FUNCTION public.handle_notice_published();

-- Also fire on INSERT if is_published = true
CREATE OR REPLACE FUNCTION public.handle_notice_insert_published()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_published = TRUE THEN
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_notice_insert_published
  BEFORE INSERT ON public.community_notices
  FOR EACH ROW EXECUTE FUNCTION public.handle_notice_insert_published();


-- ============================================================
-- STORED FUNCTION: Get dashboard stats in one call
-- Usage from frontend:
--   const { data } = await supabase.rpc('get_dashboard_stats')
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalUsers',         (SELECT COUNT(*) FROM public.profiles),
    'totalComplaints',    (SELECT COUNT(*) FROM public.complaints),
    'pendingComplaints',  (SELECT COUNT(*) FROM public.complaints WHERE status = 'pending'),
    'resolvedComplaints', (SELECT COUNT(*) FROM public.complaints WHERE status = 'resolved'),
    'totalDonors',        (SELECT COUNT(*) FROM public.blood_donors WHERE is_available = TRUE),
    'openBloodRequests',  (SELECT COUNT(*) FROM public.blood_requests WHERE status = 'open'),
    'totalNotices',       (SELECT COUNT(*) FROM public.community_notices WHERE is_published = TRUE)
  ) INTO result;

  RETURN result;
END;
$$;


-- ============================================================
-- STORED FUNCTION: Search blood donors by group + city
-- Usage:
--   supabase.rpc('search_donors', { p_blood_group: 'O+', p_city: 'Mumbai' })
-- ============================================================

CREATE OR REPLACE FUNCTION public.search_donors(
  p_blood_group blood_group DEFAULT NULL,
  p_city        TEXT        DEFAULT NULL
)
RETURNS SETOF public.blood_donors
LANGUAGE sql STABLE
AS $$
  SELECT * FROM public.blood_donors
  WHERE
    is_available = TRUE
    AND (p_blood_group IS NULL OR blood_group = p_blood_group)
    AND (p_city IS NULL OR city ILIKE '%' || p_city || '%')
  ORDER BY created_at DESC;
$$;
