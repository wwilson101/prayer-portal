/*
  # Fix Security Issues

  1. Add missing indexes for unindexed foreign keys
    - `groups.created_by` → add index
    - `prayer_prays.user_id` → add index

  2. Drop unused indexes
    - `group_members_user_id_idx` on `group_members`
    - `prayers_owner_id_idx` on `prayers`

  3. Fix mutable search_path on `public.is_group_member` function
    - Recreate with `SET search_path = public` to prevent search path injection

  Notes:
    - Auth connection strategy and leaked password protection must be configured
      via the Supabase dashboard (not via SQL migrations)
*/

-- Add index for groups.created_by (unindexed FK)
CREATE INDEX IF NOT EXISTS groups_created_by_idx ON public.groups (created_by);

-- Add index for prayer_prays.user_id (unindexed FK)
CREATE INDEX IF NOT EXISTS prayer_prays_user_id_idx ON public.prayer_prays (user_id);

-- Drop unused indexes
DROP INDEX IF EXISTS public.group_members_user_id_idx;
DROP INDEX IF EXISTS public.prayers_owner_id_idx;

-- Recreate is_group_member with fixed search_path to prevent mutable search path vulnerability
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
SELECT EXISTS (
  SELECT 1 FROM public.group_members
  WHERE group_id = p_group_id AND user_id = (select auth.uid())
);
$$;
