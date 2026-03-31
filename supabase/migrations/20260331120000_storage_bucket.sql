-- Migration to setup the 'media' storage bucket and its policies

-- 1. Create the 'media' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Define RLS policies for storage.objects for the 'media' bucket

-- Give public access to read objects
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated users to insert files
CREATE POLICY "Authenticated users can upload objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete objects"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
