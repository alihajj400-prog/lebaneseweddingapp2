-- Create storage bucket for vendor files (images and brochures)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('vendor-files', 'vendor-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow vendors to upload to their own folder
CREATE POLICY "Vendors can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow vendors to update their own files
CREATE POLICY "Vendors can update their own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vendor-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow vendors to delete their own files
CREATE POLICY "Vendors can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to vendor files
CREATE POLICY "Anyone can view vendor files"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-files');

-- Add brochure_url column to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS brochure_url text;

-- Add cover_image_url column to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS cover_image_url text;