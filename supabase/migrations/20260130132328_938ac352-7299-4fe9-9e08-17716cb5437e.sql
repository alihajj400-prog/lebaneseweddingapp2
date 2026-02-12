
-- Drop the foreign key constraint on vendors.user_id to allow sample vendor data
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_user_id_fkey;
