/*
  # Fix indexes and RLS policies

  1. Add missing indexes for unindexed foreign keys
    - group_members.user_id
    - prayer_groups.group_id
    - prayers.owner_id

  2. Remove unused indexes
    - groups_created_by_idx
    - prayer_prays_user_id_idx

  3. Fix multiple permissive UPDATE policies on profiles
    - Merge "Users can update their own profile" and "Admins can update any profile"
      into a single policy to avoid multiple permissive policy warnings
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS group_members_user_id_idx ON public.group_members (user_id);
CREATE INDEX IF NOT EXISTS prayer_groups_group_id_idx ON public.prayer_groups (group_id);
CREATE INDEX IF NOT EXISTS prayers_owner_id_idx ON public.prayers (owner_id);

-- Remove unused indexes
DROP INDEX IF EXISTS public.groups_created_by_idx;
DROP INDEX IF EXISTS public.prayer_prays_user_id_idx;

-- Fix multiple permissive UPDATE policies on profiles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Users can update own profile or admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.is_admin = true
    )
  )
  WITH CHECK (
    id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.is_admin = true
    )
  );
