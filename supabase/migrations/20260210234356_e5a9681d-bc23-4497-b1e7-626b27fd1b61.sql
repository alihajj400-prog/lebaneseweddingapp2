-- Add restrictive policy to deny unauthenticated access to profiles
CREATE POLICY "Deny public access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);