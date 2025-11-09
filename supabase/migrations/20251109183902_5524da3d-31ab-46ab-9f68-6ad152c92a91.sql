-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create issues table
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organization TEXT NOT NULL,
  category TEXT,
  urgency TEXT,
  location TEXT,
  status TEXT DEFAULT 'open',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(issue_id, user_id)
);

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Organizations policies (public read)
CREATE POLICY "Anyone can view organizations"
  ON public.organizations FOR SELECT
  USING (true);

-- Issues policies (public read, authenticated write)
CREATE POLICY "Anyone can view issues"
  ON public.issues FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create issues"
  ON public.issues FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own issues"
  ON public.issues FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own issues"
  ON public.issues FOR DELETE
  USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Anyone can view votes"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- User roles policies
CREATE POLICY "Anyone can view roles"
  ON public.user_roles FOR SELECT
  USING (true);

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for issues updated_at
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_roles;