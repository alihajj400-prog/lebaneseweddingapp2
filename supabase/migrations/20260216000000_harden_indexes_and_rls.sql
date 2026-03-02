-- ============================================================
-- PHASE 2a: Missing indexes + RLS column restrictions
-- Safe, additive migration — no data loss, no table drops.
-- ============================================================

-- ---- 1. MISSING user_id INDEXES ----
-- Every RLS policy that filters by auth.uid() = user_id needs
-- an index on user_id, otherwise every RLS check = full table scan.

CREATE INDEX IF NOT EXISTS idx_checklist_items_user_id
  ON public.checklist_items(user_id);

CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id
  ON public.budget_categories(user_id);

CREATE INDEX IF NOT EXISTS idx_guests_user_id
  ON public.guests(user_id);

CREATE INDEX IF NOT EXISTS idx_shortlist_user_id
  ON public.shortlist(user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id
  ON public.bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_bookings_vendor_id
  ON public.bookings(vendor_id);

CREATE INDEX IF NOT EXISTS idx_brochure_requests_user_id
  ON public.brochure_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_vendors_user_id
  ON public.vendors(user_id);

-- ---- 2. SECURITY: Prevent users from changing their own role ----
-- Current policy: "Users can update their own profile" has no
-- WITH CHECK and no column restriction, so users can set role='admin'.
-- Fix: replace with a policy that forbids changing the role column.

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid()));

-- ---- 3. SECURITY: Prevent vendors from self-approving ----
-- Current policy: "Vendors can update their own profile" has no
-- WITH CHECK, so a vendor can set status='approved' via direct API.
-- Fix: vendor updates must preserve the current status and user_id.

DROP POLICY IF EXISTS "Vendors can update their own profile" ON public.vendors;
CREATE POLICY "Vendors can update their own profile" ON public.vendors
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND status = (SELECT status FROM public.vendors v WHERE v.id = id LIMIT 1)
    AND user_id = auth.uid()
  );

-- ---- 4. Missing UPDATE policy on shortlist (for notes editing) ----
DROP POLICY IF EXISTS "Users can update their own shortlist" ON public.shortlist;
CREATE POLICY "Users can update their own shortlist" ON public.shortlist
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- 5. Admin policies for profiles (UPDATE + DELETE) ----
-- Admins need UPDATE for user management and DELETE for account removal.

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ---- 6. Admin INSERT policy for vendors ----
-- Admins create vendors via the editor (user_id = placeholder).
DROP POLICY IF EXISTS "Admins can insert vendors" ON public.vendors;
CREATE POLICY "Admins can insert vendors" ON public.vendors
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
