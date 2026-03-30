-- Supabase Migration: Initial Schema for SkyFlow

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Tied to Supabase Auth)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'copywriter', 'designer', 'scheduler', 'client')) NOT NULL,
  avatar TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  avatar TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Batches
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Posts
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  caption TEXT,
  status TEXT NOT NULL,
  rating INTEGER,
  feedback TEXT,
  date TIMESTAMPTZ,
  platform TEXT,
  format TEXT,
  title TEXT,
  content_pillar TEXT,
  visual_direction TEXT,
  video_script TEXT,
  cta TEXT,
  version INTEGER DEFAULT 1 NOT NULL,
  comments_count INTEGER DEFAULT 0 NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Post Media
CREATE TABLE public.post_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video')) NOT NULL,
  format TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL
);

-- 6. Post History
CREATE TABLE public.post_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT now() NOT NULL,
  details TEXT
);

-- 7. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT now() NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create minimal RLS Policies (For now, allowing authenticated users full access to their agency)
-- Note: In a real multi-tenant scenario, we would filter by agency_id or role.

CREATE POLICY "Allow authenticated full access to profiles" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to clients" ON public.clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to batches" ON public.batches FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to posts" ON public.posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to post_media" ON public.post_media FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to post_history" ON public.post_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated full access to notifications" ON public.notifications FOR ALL TO authenticated USING (true);
