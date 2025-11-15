-- Add latitude and longitude columns to issues table
ALTER TABLE public.issues 
ADD COLUMN latitude double precision,
ADD COLUMN longitude double precision;

-- Create an index for spatial queries
CREATE INDEX idx_issues_coordinates ON public.issues(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;