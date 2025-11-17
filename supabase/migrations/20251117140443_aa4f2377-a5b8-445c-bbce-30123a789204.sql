-- Add pincode column to issues table
ALTER TABLE public.issues 
ADD COLUMN IF NOT EXISTS pincode TEXT;