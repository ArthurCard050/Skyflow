-- ============================================================
-- SkyFlow v2 Migration: Multi-Tenancy, Teams, Briefings, RBAC
-- ============================================================

-- 1. Rename 'scheduler' role to 'social_media'
UPDATE profiles SET role = 'social_media' WHERE role = 'scheduler';
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'copywriter', 'designer', 'social_media', 'client'));

-- 2. Add owner_id to core tables
ALTER TABLE clients ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Assign all existing data to founding admin
UPDATE clients SET owner_id = 'b5f49c68-da0a-4c61-bbfe-0c56b0d5fe91' WHERE owner_id IS NULL;
UPDATE batches SET owner_id = 'b5f49c68-da0a-4c61-bbfe-0c56b0d5fe91' WHERE owner_id IS NULL;
UPDATE posts SET owner_id = 'b5f49c68-da0a-4c61-bbfe-0c56b0d5fe91' WHERE owner_id IS NULL;
UPDATE notifications SET owner_id = 'b5f49c68-da0a-4c61-bbfe-0c56b0d5fe91' WHERE owner_id IS NULL;

ALTER TABLE clients ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE batches ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE posts ALTER COLUMN owner_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN owner_id SET NOT NULL;

-- 3. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('copywriter', 'designer', 'social_media', 'client')),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(owner_id, member_id)
);

-- 4. Create briefings tables
CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Novo Briefing',
  content JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS briefing_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Helper function: get effective owner_id for current user
CREATE OR REPLACE FUNCTION get_my_owner_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  _role TEXT;
  _owner UUID;
BEGIN
  SELECT role INTO _role FROM profiles WHERE id = auth.uid();
  IF _role = 'admin' THEN
    RETURN auth.uid();
  END IF;
  SELECT owner_id INTO _owner FROM team_members WHERE member_id = auth.uid() LIMIT 1;
  RETURN _owner;
END;
$$;

-- 6. Drop old permissive policies
DROP POLICY IF EXISTS "Allow authenticated full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated full access to clients" ON clients;
DROP POLICY IF EXISTS "Allow authenticated full access to batches" ON batches;
DROP POLICY IF EXISTS "Allow authenticated full access to posts" ON posts;
DROP POLICY IF EXISTS "Allow authenticated full access to post_media" ON post_media;
DROP POLICY IF EXISTS "Allow authenticated full access to post_history" ON post_history;
DROP POLICY IF EXISTS "Allow authenticated full access to notifications" ON notifications;

-- 7. New RLS policies
-- PROFILES
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR id IN (SELECT member_id FROM team_members WHERE owner_id = auth.uid())
    OR id IN (SELECT owner_id FROM team_members WHERE member_id = auth.uid())
  );
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- CLIENTS
CREATE POLICY "clients_select" ON clients FOR SELECT TO authenticated
  USING (owner_id = get_my_owner_id());
CREATE POLICY "clients_insert" ON clients FOR INSERT TO authenticated
  WITH CHECK (owner_id = get_my_owner_id());
CREATE POLICY "clients_update" ON clients FOR UPDATE TO authenticated
  USING (owner_id = get_my_owner_id());
CREATE POLICY "clients_delete" ON clients FOR DELETE TO authenticated
  USING (owner_id = get_my_owner_id());

-- BATCHES
CREATE POLICY "batches_select" ON batches FOR SELECT TO authenticated
  USING (owner_id = get_my_owner_id());
CREATE POLICY "batches_insert" ON batches FOR INSERT TO authenticated
  WITH CHECK (owner_id = get_my_owner_id());
CREATE POLICY "batches_update" ON batches FOR UPDATE TO authenticated
  USING (owner_id = get_my_owner_id());
CREATE POLICY "batches_delete" ON batches FOR DELETE TO authenticated
  USING (owner_id = get_my_owner_id());

-- POSTS
CREATE POLICY "posts_select" ON posts FOR SELECT TO authenticated
  USING (owner_id = get_my_owner_id());
CREATE POLICY "posts_insert" ON posts FOR INSERT TO authenticated
  WITH CHECK (owner_id = get_my_owner_id());
CREATE POLICY "posts_update" ON posts FOR UPDATE TO authenticated
  USING (owner_id = get_my_owner_id());
CREATE POLICY "posts_delete" ON posts FOR DELETE TO authenticated
  USING (owner_id = get_my_owner_id());

-- POST_MEDIA (via posts join)
CREATE POLICY "post_media_all" ON post_media FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.owner_id = get_my_owner_id()));

-- POST_HISTORY (via posts join)
CREATE POLICY "post_history_all" ON post_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM posts WHERE posts.id = post_history.post_id AND posts.owner_id = get_my_owner_id()));

-- NOTIFICATIONS
CREATE POLICY "notifications_all" ON notifications FOR ALL TO authenticated
  USING (owner_id = get_my_owner_id());

-- TEAM_MEMBERS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_select" ON team_members FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR member_id = auth.uid());
CREATE POLICY "team_insert" ON team_members FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "team_update" ON team_members FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());
CREATE POLICY "team_delete" ON team_members FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- BRIEFINGS
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "briefings_all" ON briefings FOR ALL TO authenticated
  USING (owner_id = get_my_owner_id());

-- BRIEFING_COMMENTS
ALTER TABLE briefing_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "briefing_comments_all" ON briefing_comments FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM briefings WHERE briefings.id = briefing_comments.briefing_id AND briefings.owner_id = get_my_owner_id()));

-- 8. Performance indexes
CREATE INDEX IF NOT EXISTS idx_clients_owner ON clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_batches_owner ON batches(owner_id);
CREATE INDEX IF NOT EXISTS idx_posts_owner ON posts(owner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_owner ON notifications(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_owner ON team_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_member ON team_members(member_id);
CREATE INDEX IF NOT EXISTS idx_briefings_owner ON briefings(owner_id);
CREATE INDEX IF NOT EXISTS idx_briefings_client ON briefings(client_id);
CREATE INDEX IF NOT EXISTS idx_briefing_comments_briefing ON briefing_comments(briefing_id);
