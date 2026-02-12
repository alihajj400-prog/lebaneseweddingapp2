-- Create bookings table for vendor booking requests
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  guest_count INTEGER,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  vendor_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Vendors can view bookings for their business" 
ON public.bookings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM vendors 
  WHERE vendors.id = bookings.vendor_id 
  AND vendors.user_id = auth.uid()
));

CREATE POLICY "Vendors can update booking status" 
ON public.bookings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM vendors 
  WHERE vendors.id = bookings.vendor_id 
  AND vendors.user_id = auth.uid()
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();