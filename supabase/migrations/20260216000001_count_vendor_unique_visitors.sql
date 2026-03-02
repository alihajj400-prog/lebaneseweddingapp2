-- RPC to count distinct session_ids for a vendor's views.
-- Used by vendor dashboard analytics; runs with caller's RLS context.
CREATE OR REPLACE FUNCTION public.count_vendor_unique_visitors(p_vendor_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(DISTINCT session_id), 0)::bigint
  FROM public.vendor_views
  WHERE vendor_id = p_vendor_id;
$$;
