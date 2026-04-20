-- Drop the overly permissive public SELECT policy on avatars
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Replace with a folder-scoped policy: requires knowing the full path (userId/file)
CREATE POLICY "Avatars viewable by direct path"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] IS NOT NULL
);