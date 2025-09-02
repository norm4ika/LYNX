-- Supabase Storage Bucket Setup for n8n-ad-genius
-- Run this in your Supabase SQL Editor

-- 1. Create the images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  15728640, -- 15MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
) ON CONFLICT (id) DO NOTHING;

-- 2. Create RLS policies for the images bucket
-- Policy for public read access
CREATE POLICY "Public Read Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Policy for authenticated users to upload
CREATE POLICY "Authenticated Users Can Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- Policy for users to update their own files
CREATE POLICY "Users Can Update Own Files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to delete their own files
CREATE POLICY "Users Can Delete Own Files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Verify bucket creation
SELECT * FROM storage.buckets WHERE name = 'images';

-- 5. Check policies
SELECT * FROM storage.policies WHERE table_name = 'objects' AND table_schema = 'storage';
