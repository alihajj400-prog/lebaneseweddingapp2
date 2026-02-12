-- Create enums for user roles, vendor categories, and Lebanese regions
CREATE TYPE public.user_role AS ENUM ('couple', 'vendor', 'admin');
CREATE TYPE public.vendor_category AS ENUM ('venue', 'photographer', 'dj', 'zaffe', 'bridal_dress', 'makeup_artist', 'flowers', 'car_rental', 'catering', 'wedding_planner', 'videographer', 'jewelry', 'invitations', 'cake', 'entertainment', 'other');
CREATE TYPE public.lebanese_region AS ENUM ('beirut', 'mount_lebanon', 'north', 'south', 'bekaa', 'nabatieh');
CREATE TYPE public.rsvp_status AS ENUM ('pending', 'confirmed', 'declined', 'maybe');
CREATE TYPE public.guest_group AS ENUM ('family', 'friends', 'coworkers', 'other');
CREATE TYPE public.vendor_status AS ENUM ('pending', 'approved', 'rejected');

-- Profiles table for all users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'couple',
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  wedding_date DATE,
  partner_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  category vendor_category NOT NULL,
  region lebanese_region NOT NULL,
  description TEXT,
  starting_price_usd NUMERIC(10,2),
  starting_price_lbp NUMERIC(15,0),
  phone TEXT,
  whatsapp TEXT,
  instagram TEXT,
  email TEXT,
  website TEXT,
  portfolio_images TEXT[] DEFAULT '{}',
  status vendor_status NOT NULL DEFAULT 'pending',
  shortlist_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklist table for wedding tasks
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_months_before INTEGER,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budget categories table
CREATE TABLE public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  estimated_usd NUMERIC(10,2) DEFAULT 0,
  estimated_lbp NUMERIC(15,0) DEFAULT 0,
  actual_usd NUMERIC(10,2) DEFAULT 0,
  actual_lbp NUMERIC(15,0) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Guests table
CREATE TABLE public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  guest_group guest_group NOT NULL DEFAULT 'other',
  rsvp_status rsvp_status NOT NULL DEFAULT 'pending',
  plus_one BOOLEAN NOT NULL DEFAULT false,
  plus_one_name TEXT,
  dietary_restrictions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shortlist table for saving vendors
CREATE TABLE public.shortlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, vendor_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlist ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vendors policies - public read for approved vendors
CREATE POLICY "Anyone can view approved vendors" ON public.vendors FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);
CREATE POLICY "Vendors can update their own profile" ON public.vendors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert vendor profile" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Checklist policies
CREATE POLICY "Users can view their own checklist" ON public.checklist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert checklist items" ON public.checklist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own checklist" ON public.checklist_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own checklist" ON public.checklist_items FOR DELETE USING (auth.uid() = user_id);

-- Budget policies
CREATE POLICY "Users can view their own budget" ON public.budget_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert budget items" ON public.budget_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own budget" ON public.budget_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own budget" ON public.budget_categories FOR DELETE USING (auth.uid() = user_id);

-- Guest policies
CREATE POLICY "Users can view their own guests" ON public.guests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert guests" ON public.guests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own guests" ON public.guests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own guests" ON public.guests FOR DELETE USING (auth.uid() = user_id);

-- Shortlist policies
CREATE POLICY "Users can view their own shortlist" ON public.shortlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to shortlist" ON public.shortlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from shortlist" ON public.shortlist FOR DELETE USING (auth.uid() = user_id);

-- User roles table for admin
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for vendors
CREATE POLICY "Admins can view all vendors" ON public.vendors FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any vendor" ON public.vendors FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any vendor" ON public.vendors FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_checklist_updated_at BEFORE UPDATE ON public.checklist_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_budget_updated_at BEFORE UPDATE ON public.budget_categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();