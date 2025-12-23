-- Migration to fix relationships for Founders Corner and Gig Marketplace
-- This changes the foreign keys to point to public.profiles instead of auth.users
-- which allows for easier joining and better referential integrity in the public schema.

-- 1. Founder Listings
ALTER TABLE public.founder_listings
DROP CONSTRAINT IF EXISTS founder_listings_user_id_fkey;

ALTER TABLE public.founder_listings
ADD CONSTRAINT founder_listings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 2. Gig Listings
ALTER TABLE public.gig_listings
DROP CONSTRAINT IF EXISTS gig_listings_user_id_fkey;

ALTER TABLE public.gig_listings
ADD CONSTRAINT gig_listings_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 3. Founder Applications
ALTER TABLE public.founder_applications
DROP CONSTRAINT IF EXISTS founder_applications_applicant_id_fkey;

ALTER TABLE public.founder_applications
ADD CONSTRAINT founder_applications_applicant_id_fkey
FOREIGN KEY (applicant_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- 4. Gig Applications
ALTER TABLE public.gig_applications
DROP CONSTRAINT IF EXISTS gig_applications_applicant_id_fkey;

ALTER TABLE public.gig_applications
ADD CONSTRAINT gig_applications_applicant_id_fkey
FOREIGN KEY (applicant_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;
