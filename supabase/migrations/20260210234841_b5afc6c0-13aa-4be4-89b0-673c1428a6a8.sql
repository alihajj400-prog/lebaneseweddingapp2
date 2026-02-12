-- 1. Add SELECT policy for users to view their own brochure requests
CREATE POLICY "Users can view their own brochure requests"
ON public.brochure_requests
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Replace the overly permissive vendor_views INSERT policy
-- Drop the old "Anyone can insert" policy
DROP POLICY IF EXISTS "Anyone can insert vendor views" ON public.vendor_views;

-- Add a more restrictive policy: require a valid vendor_id reference
CREATE POLICY "Anyone can insert vendor views with valid vendor"
ON public.vendor_views
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND status = 'approved')
);

-- 3. Restrict user_roles INSERT: users can only assign themselves the 'vendor' role
-- This prevents privilege escalation to 'admin'
DROP POLICY IF EXISTS "Users can insert their own vendor role" ON public.user_roles;
CREATE POLICY "Users can only assign vendor role to themselves"
ON public.user_roles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND role = 'vendor'
);