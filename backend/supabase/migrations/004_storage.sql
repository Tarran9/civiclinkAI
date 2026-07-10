-- ============================================================
-- CIVICLINK AI — STORAGE BUCKETS & POLICIES
-- Migration: 004_storage.sql
-- Run this AFTER 003_triggers_and_functions.sql
-- ============================================================

-- ============================================================
-- STORAGE BUCKET: complaint-images
-- Stores evidence photos uploaded with complaints.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-images',
  'complaint-images',
  TRUE,                       -- publicly accessible via public_url
  5242880,                    -- 5 MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STORAGE BUCKET: avatars
-- Stores user profile photos.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  2097152,                    -- 2 MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STORAGE POLICIES: complaint-images bucket
-- ============================================================

-- Anyone can VIEW public complaint images
CREATE POLICY "complaint_images_bucket_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-images');

-- Authenticated users can upload complaint images
CREATE POLICY "complaint_images_bucket_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'complaint-images'
    AND auth.uid() IS NOT NULL
  );

-- Users can delete their own uploads; admins can delete any
CREATE POLICY "complaint_images_bucket_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'complaint-images'
    AND (
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );


-- ============================================================
-- STORAGE POLICIES: avatars bucket
-- ============================================================

-- Anyone can view avatars
CREATE POLICY "avatars_bucket_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Users upload their own avatar (scoped by user id folder)
CREATE POLICY "avatars_bucket_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Users update/delete only their own avatar
CREATE POLICY "avatars_bucket_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars_bucket_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
