/*
  # Fix RLS Performance, Indexes, and Policy Issues

  1. RLS Performance
     - Replace auth.uid() with (select auth.uid()) in all policies to prevent
       per-row re-evaluation (improves query performance at scale)

  2. Missing Foreign Key Indexes
     - Add index on groups.created_by (groups_created_by_fkey)
     - Add index on prayer_prays.user_id (prayer_prays_user_id_fkey)

  3. Multiple Permissive Policies
     - Consolidate duplicate SELECT/DELETE policies per table into single
       policies using OR logic to avoid redundant evaluations

  4. Drop Unused Indexes
     - Remove indexes that have never been used
*/

-- ============================================================
-- PROFILES: drop and recreate policies with (select auth.uid())
-- ============================================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- Consolidated UPDATE: own profile OR admin
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

-- ============================================================
-- GROUPS: drop and recreate all policies
-- ============================================================

DROP POLICY IF EXISTS "Groups viewable by authenticated users" ON public.groups;
DROP POLICY IF EXISTS "Admins can view all groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Creator can update group" ON public.groups;
DROP POLICY IF EXISTS "Creator can delete group" ON public.groups;
DROP POLICY IF EXISTS "Admins can delete any group" ON public.groups;

-- Consolidated SELECT: all authenticated users (was already true for all)
CREATE POLICY "Groups viewable by authenticated users"
  ON public.groups FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Creator can update group"
  ON public.groups FOR UPDATE TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);

-- Consolidated DELETE: creator OR admin
CREATE POLICY "Creator or admin can delete group"
  ON public.groups FOR DELETE TO authenticated
  USING (
    (select auth.uid()) = created_by
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

-- ============================================================
-- GROUP_MEMBERS: drop and recreate all policies
-- ============================================================

DROP POLICY IF EXISTS "Members can view their groups member lists" ON public.group_members;
DROP POLICY IF EXISTS "Admins can view all group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Users can leave groups" ON public.group_members;
DROP POLICY IF EXISTS "Admins can remove any member" ON public.group_members;

-- Consolidated SELECT: own membership OR admin
CREATE POLICY "Members or admins can view group members"
  ON public.group_members FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = (select auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

CREATE POLICY "Users can join groups"
  ON public.group_members FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Consolidated DELETE: own membership OR admin
CREATE POLICY "Users or admins can remove group members"
  ON public.group_members FOR DELETE TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

-- ============================================================
-- PRAYERS: drop and recreate all policies
-- ============================================================

DROP POLICY IF EXISTS "Prayers visible to prayer group members" ON public.prayers;
DROP POLICY IF EXISTS "Admins can view all prayers" ON public.prayers;
DROP POLICY IF EXISTS "Owner can insert prayer" ON public.prayers;
DROP POLICY IF EXISTS "Owner can update prayer" ON public.prayers;
DROP POLICY IF EXISTS "Owner can delete prayer" ON public.prayers;

-- Consolidated SELECT: owner OR group member OR admin
CREATE POLICY "Prayers visible to owners, group members, and admins"
  ON public.prayers FOR SELECT TO authenticated
  USING (
    owner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.prayer_groups pg
      JOIN public.group_members gm ON gm.group_id = pg.group_id
      WHERE pg.prayer_id = prayers.id AND gm.user_id = (select auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

CREATE POLICY "Owner can insert prayer"
  ON public.prayers FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Owner can update prayer"
  ON public.prayers FOR UPDATE TO authenticated
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Owner can delete prayer"
  ON public.prayers FOR DELETE TO authenticated
  USING ((select auth.uid()) = owner_id);

-- ============================================================
-- PRAYER_GROUPS: drop and recreate all policies
-- ============================================================

DROP POLICY IF EXISTS "Group members can view prayer_groups" ON public.prayer_groups;
DROP POLICY IF EXISTS "Admins can view all prayer_groups" ON public.prayer_groups;
DROP POLICY IF EXISTS "Prayer owner can insert prayer_groups" ON public.prayer_groups;
DROP POLICY IF EXISTS "Prayer owner can delete prayer_groups" ON public.prayer_groups;

-- Consolidated SELECT: group member OR admin
CREATE POLICY "Group members or admins can view prayer_groups"
  ON public.prayer_groups FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = prayer_groups.group_id AND gm.user_id = (select auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

CREATE POLICY "Prayer owner can insert prayer_groups"
  ON public.prayer_groups FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prayers p
      WHERE p.id = prayer_groups.prayer_id AND p.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Prayer owner can delete prayer_groups"
  ON public.prayer_groups FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.prayers p
      WHERE p.id = prayer_groups.prayer_id AND p.owner_id = (select auth.uid())
    )
  );

-- ============================================================
-- PRAYER_PRAYS: drop and recreate all policies
-- ============================================================

DROP POLICY IF EXISTS "Group members can see prayer_prays" ON public.prayer_prays;
DROP POLICY IF EXISTS "Admins can view all prayer_prays" ON public.prayer_prays;
DROP POLICY IF EXISTS "Users can record their own pray" ON public.prayer_prays;
DROP POLICY IF EXISTS "Users can remove their own pray" ON public.prayer_prays;

-- Consolidated SELECT: group member OR admin
CREATE POLICY "Group members or admins can view prayer_prays"
  ON public.prayer_prays FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.prayer_groups pg
      JOIN public.group_members gm ON gm.group_id = pg.group_id
      WHERE pg.prayer_id = prayer_prays.prayer_id AND gm.user_id = (select auth.uid())
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true)
  );

CREATE POLICY "Users can record their own pray"
  ON public.prayer_prays FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove their own pray"
  ON public.prayer_prays FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- MISSING FOREIGN KEY INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS groups_created_by_idx ON public.groups (created_by);
CREATE INDEX IF NOT EXISTS prayer_prays_user_id_idx ON public.prayer_prays (user_id);

-- ============================================================
-- DROP UNUSED INDEXES
-- ============================================================

DROP INDEX IF EXISTS public.prayers_owner_id_idx;
DROP INDEX IF EXISTS public.prayers_status_idx;
DROP INDEX IF EXISTS public.prayer_groups_group_id_idx;
DROP INDEX IF EXISTS public.prayer_groups_prayer_id_idx;
DROP INDEX IF EXISTS public.group_members_user_id_idx;
DROP INDEX IF EXISTS public.group_members_group_id_idx;
DROP INDEX IF EXISTS public.prayer_prays_prayer_id_idx;
DROP INDEX IF EXISTS public.groups_code_upper_idx;
