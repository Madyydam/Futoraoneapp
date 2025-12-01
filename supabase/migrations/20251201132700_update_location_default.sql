-- Update all existing profiles to have location 'Pune'
UPDATE public.profiles SET location = 'Pune';

-- Set default value for new profiles
ALTER TABLE public.profiles ALTER COLUMN location SET DEFAULT 'Pune';
