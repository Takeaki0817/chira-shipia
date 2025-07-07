-- Storage setup migration
-- This migration sets up Supabase Storage buckets and policies

-- Create storage bucket for sale images
INSERT INTO storage.buckets (id, name, public)
VALUES ('sale-images', 'sale-images', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Comprehensive storage policies for sale images
CREATE POLICY "Users can upload their own sale images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own sale images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own sale images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own sale images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'sale-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );