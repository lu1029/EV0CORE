-- Restrict listing on public buckets to authenticated users
DROP POLICY IF EXISTS "Email assets are publicly readable" ON storage.objects;
CREATE POLICY "Email assets are publicly readable" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'email-assets');

DROP POLICY IF EXISTS "Exercise images are publicly viewable" ON storage.objects;
CREATE POLICY "Exercise images are publicly viewable" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'exercise-images');

DROP POLICY IF EXISTS "Feed photos publicly readable" ON storage.objects;
CREATE POLICY "Feed photos publicly readable" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'feed-photos');

DROP POLICY IF EXISTS "Food photos publicly readable" ON storage.objects;
CREATE POLICY "Food photos publicly readable" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'food-photos');

DROP POLICY IF EXISTS "Club covers are publicly readable" ON storage.objects;
CREATE POLICY "Club covers are publicly readable" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'club-covers');
