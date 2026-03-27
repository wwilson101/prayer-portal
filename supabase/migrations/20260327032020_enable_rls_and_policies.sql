/*
  # Enable RLS and create all security policies

  Enables row-level security and adds access policies for all tables.
*/

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);


-- GROUPS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Groups viewable by authenticated users"
  ON public.groups FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can update group"
  ON public.groups FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can delete group"
  ON public.groups FOR DELETE TO authenticated
  USING (auth.uid() = created_by);


-- GROUP_MEMBERS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their groups member lists"
  ON public.group_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);


-- PRAYERS
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prayers visible to prayer group members"
  ON public.prayers FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.prayer_groups pg
      JOIN public.group_members gm ON gm.group_id = pg.group_id
      WHERE pg.prayer_id = prayers.id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner can insert prayer"
  ON public.prayers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can update prayer"
  ON public.prayers FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete prayer"
  ON public.prayers FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);


-- PRAYER_GROUPS
ALTER TABLE public.prayer_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view prayer_groups"
  ON public.prayer_groups FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = prayer_groups.group_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Prayer owner can insert prayer_groups"
  ON public.prayer_groups FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prayers p
      WHERE p.id = prayer_groups.prayer_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Prayer owner can delete prayer_groups"
  ON public.prayer_groups FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.prayers p
      WHERE p.id = prayer_groups.prayer_id AND p.owner_id = auth.uid()
    )
  );


-- PRAYER_PRAYS
ALTER TABLE public.prayer_prays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can see prayer_prays"
  ON public.prayer_prays FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.prayer_groups pg
      JOIN public.group_members gm ON gm.group_id = pg.group_id
      WHERE pg.prayer_id = prayer_prays.prayer_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can record their own pray"
  ON public.prayer_prays FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own pray"
  ON public.prayer_prays FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
