-- Make avatars bucket private (no anonymous public access)
UPDATE storage.buckets SET public = false WHERE id = 'avatars';

-- Drop previous overly-permissive SELECT policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Avatars viewable by direct path" ON storage.objects;

-- Owner-only SELECT: file path must start with the user's UID folder
CREATE POLICY "Users can view own avatar"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);