-- Add admin access policies for bookings table
CREATE POLICY "Admins can view all bookings"
ON public.bookings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can update all bookings"
ON public.bookings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::user_role));