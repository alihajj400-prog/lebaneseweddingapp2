-- Indexes for admin vendor list (search, filters, sort)
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_region ON public.vendors(region);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON public.vendors(created_at DESC);

-- Composite for common admin filter (status + created_at)
CREATE INDEX IF NOT EXISTS idx_vendors_status_created ON public.vendors(status, created_at DESC);

-- Allow admins to read all profiles (for analytics and user management)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
