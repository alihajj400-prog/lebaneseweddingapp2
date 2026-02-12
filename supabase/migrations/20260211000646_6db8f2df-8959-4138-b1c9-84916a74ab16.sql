
-- Add is_sample column to vendors table
ALTER TABLE public.vendors ADD COLUMN is_sample boolean NOT NULL DEFAULT false;

-- Mark existing sample vendors (using placeholder UUID)
UPDATE public.vendors SET is_sample = true WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Create validation trigger to enforce data integrity:
-- Non-sample vendors must have a valid user_id (not the placeholder)
CREATE OR REPLACE FUNCTION public.validate_vendor_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Sample vendors can use placeholder UUID
  IF NEW.is_sample = true THEN
    RETURN NEW;
  END IF;
  
  -- Non-sample vendors must not use the placeholder UUID
  IF NEW.user_id = '00000000-0000-0000-0000-000000000000' THEN
    RAISE EXCEPTION 'Non-sample vendors must have a valid user_id';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_vendor_user_id_trigger
BEFORE INSERT OR UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.validate_vendor_user_id();
