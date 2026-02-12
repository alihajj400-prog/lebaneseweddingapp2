-- Add subscription fields to vendors table
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'featured')),
ADD COLUMN IF NOT EXISTS subscription_valid_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_images INTEGER DEFAULT 3;

-- Add status field to brochure_requests for lead management
ALTER TABLE public.brochure_requests
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'lost')),
ADD COLUMN IF NOT EXISTS wedding_date DATE,
ADD COLUMN IF NOT EXISTS guest_count INTEGER,
ADD COLUMN IF NOT EXISTS budget_range TEXT;

-- Create index for faster featured vendor queries
CREATE INDEX IF NOT EXISTS idx_vendors_featured ON public.vendors(is_featured, subscription_plan) WHERE status = 'approved';

-- Create index for lead status queries
CREATE INDEX IF NOT EXISTS idx_brochure_requests_status ON public.brochure_requests(vendor_id, status);

-- Update RLS policy for vendors to allow updating brochure_requests status
CREATE POLICY "Vendors can update their lead status"
ON public.brochure_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM vendors
    WHERE vendors.id = brochure_requests.vendor_id
    AND vendors.user_id = auth.uid()
  )
);