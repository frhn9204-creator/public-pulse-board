-- Drop trigger first, then recreate function with correct search_path
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
DROP FUNCTION IF EXISTS public.update_comments_updated_at();

CREATE OR REPLACE FUNCTION public.update_comments_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_comments_updated_at();