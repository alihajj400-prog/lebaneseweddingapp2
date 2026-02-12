-- Create table to track vendor profile views
CREATE TABLE public.vendor_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id uuid,
  session_id text,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table to track brochure requests
CREATE TABLE public.brochure_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  message text,
  contact_method text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.vendor_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brochure_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_views
-- Anyone can insert a view (even anonymous for tracking)
CREATE POLICY "Anyone can insert vendor views"
  ON public.vendor_views
  FOR INSERT
  WITH CHECK (true);

-- Vendors can view their own profile views
CREATE POLICY "Vendors can view their own profile views"
  ON public.vendor_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors 
      WHERE vendors.id = vendor_views.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Admins can view all
CREATE POLICY "Admins can view all vendor views"
  ON public.vendor_views
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for brochure_requests
-- Users can insert brochure requests
CREATE POLICY "Users can insert brochure requests"
  ON public.brochure_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Vendors can view their own brochure requests
CREATE POLICY "Vendors can view their own brochure requests"
  ON public.brochure_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors 
      WHERE vendors.id = brochure_requests.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Admins can view all brochure requests
CREATE POLICY "Admins can view all brochure requests"
  ON public.brochure_requests
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_vendor_views_vendor_id ON public.vendor_views(vendor_id);
CREATE INDEX idx_vendor_views_viewed_at ON public.vendor_views(viewed_at);
CREATE INDEX idx_brochure_requests_vendor_id ON public.brochure_requests(vendor_id);
CREATE INDEX idx_brochure_requests_created_at ON public.brochure_requests(created_at);