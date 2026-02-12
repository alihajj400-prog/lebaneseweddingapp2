-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS estimated_budget_usd integer,
ADD COLUMN IF NOT EXISTS estimated_guests text,
ADD COLUMN IF NOT EXISTS venue_booked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_wedding_day text,
ADD COLUMN IF NOT EXISTS preferred_wedding_month text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;