-- Create storage policies for the moments bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('moments', 'moments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public access to moments
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'moments');

-- Allow authenticated users to upload to their own folder in moments
CREATE POLICY "Authenticated users can upload moments" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'moments' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Allow users to delete their own moments
CREATE POLICY "Users can delete their own moments" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'moments' AND (auth.uid())::text = (storage.foldername(name))[1]);
