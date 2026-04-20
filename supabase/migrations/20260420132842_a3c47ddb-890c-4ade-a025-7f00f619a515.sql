-- 1. Add photo_url column to runs
ALTER TABLE public.runs
ADD COLUMN IF NOT EXISTS photo_url text;

-- 2. Create private bucket for activity photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS policies: users can only access files in their own folder {user_id}/...
CREATE POLICY "Users can view own activity photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'activity-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own activity photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'activity-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own activity photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'activity-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own activity photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'activity-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);