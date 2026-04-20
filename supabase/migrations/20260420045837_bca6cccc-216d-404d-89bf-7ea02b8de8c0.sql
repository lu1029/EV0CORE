INSERT INTO storage.buckets (id, name, public) VALUES ('email-assets', 'email-assets', true) ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Email assets are publicly readable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'email-assets');