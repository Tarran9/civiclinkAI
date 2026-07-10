-- ============================================================
-- CIVICLINK AI — SEED DATA (for development/testing)
-- Migration: 005_seed_data.sql
-- ⚠️  Run ONLY in development. Never run in production.
-- ============================================================

-- ============================================================
-- NOTE: You need real auth.users first.
-- Sign up two test accounts via the Supabase Auth UI or app,
-- then replace the UUIDs below with the actual auth user IDs.
-- ============================================================

-- Replace these with your actual user UUIDs from auth.users
DO $$
DECLARE
  admin_id   UUID := '00000000-0000-0000-0000-000000000001'; -- ← Replace
  citizen_id UUID := '00000000-0000-0000-0000-000000000002'; -- ← Replace
BEGIN

  -- Elevate the admin user role
  UPDATE public.profiles
  SET role = 'admin', full_name = 'Admin User'
  WHERE id = admin_id;

  -- --------------------------------------------------------
  -- Sample Complaints
  -- --------------------------------------------------------
  INSERT INTO public.complaints (user_id, title, description, category, status, priority, location, assigned_department)
  VALUES
    (citizen_id, 'Large pothole on Main Street', 'A dangerous pothole near the bus stop causing accidents.', 'pothole', 'pending', 'high', 'Main Street near Bus Stop 12', 'Roads & Infrastructure'),
    (citizen_id, 'Overflowing garbage near park', 'Garbage bins overflowing for 3 days near City Park gate.', 'garbage', 'in_progress', 'medium', 'City Park Main Gate', 'Sanitation Department'),
    (citizen_id, 'Street light not working', 'Two consecutive street lights near school are out since last week.', 'street_light', 'resolved', 'low', 'Near Government School, Sector 5', 'Electricity Department'),
    (citizen_id, 'Water pipeline leakage', 'Heavy water leakage on MG Road causing road waterlogging.', 'water_leakage', 'pending', 'critical', 'MG Road near Junction', 'Water Supply Board');

  -- --------------------------------------------------------
  -- Sample Blood Donors
  -- --------------------------------------------------------
  INSERT INTO public.blood_donors (user_id, blood_group, is_available, city, state, contact_number)
  VALUES
    (citizen_id, 'O+', TRUE, 'Mumbai', 'Maharashtra', '+91-9876543210');

  -- --------------------------------------------------------
  -- Sample Blood Request
  -- --------------------------------------------------------
  INSERT INTO public.blood_requests (requester_id, patient_name, blood_group, units_required, hospital_name, hospital_address, contact_number, urgency, status, required_by)
  VALUES
    (citizen_id, 'Ravi Kumar', 'B+', 2, 'City General Hospital', '14 Hospital Road, Mumbai, Maharashtra', '+91-9898989898', 'urgent', 'open', CURRENT_DATE + 2);

  -- --------------------------------------------------------
  -- Sample Community Notices
  -- --------------------------------------------------------
  INSERT INTO public.community_notices (author_id, title, content, category, is_published, is_pinned)
  VALUES
    (admin_id, 'Water Supply Shutdown Notice', 'Due to maintenance work, water supply will be suspended in Sectors 3–7 on Saturday from 6AM to 2PM.', 'maintenance', TRUE, TRUE),
    (admin_id, 'Free Health Check-up Camp', 'Municipal Corporation is organizing a free health check-up camp at Community Hall on Sunday, 10AM–4PM.', 'health', TRUE, FALSE),
    (admin_id, 'Independence Day Parade Route', 'Certain roads will be closed on 15th August for the Independence Day parade. Plan alternate routes.', 'event', TRUE, FALSE);

  -- --------------------------------------------------------
  -- Welcome Notifications
  -- --------------------------------------------------------
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES
    (citizen_id, 'Welcome to CivicLink AI!', 'Thank you for joining. You can now file complaints, donate blood, and stay updated with community notices.', 'welcome'),
    (admin_id, 'Admin Access Granted', 'Your account has been granted admin privileges. Manage complaints, notices, and users from the admin panel.', 'system');

END $$;
