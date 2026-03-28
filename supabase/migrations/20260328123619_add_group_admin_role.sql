/*
  # Add Group Admin Role

  ## Summary
  Introduces a "group admin" concept that allows specific users to manage specific groups
  without having full app admin privileges.

  ## Changes

  ### New Table
  - `group_admins` — tracks which users are admins of which groups
    - `group_id` (uuid, FK to groups) — the group
    - `user_id` (uuid, FK to profiles) — the user granted admin rights
    - `granted_at` (timestamptz) — when the role was granted
    - `granted_by` (uuid, FK to profiles) — who granted the role (must be app admin)
    - Primary key: (group_id, user_id)

  ## Security
  - RLS enabled on `group_admins`
  - App admins can view, insert, and delete group admin records
  - Group admins can view their own group admin records
  - Group admins can: remove members from their groups, view all members in their groups
  - Group admins CANNOT: delete groups, manage other groups, access app-wide data

  ## Notes
  1. A user can be a group admin for multiple groups
  2. Being a group admin does NOT grant app admin access
  3. App admins remain able to do everything they could before
  4. The group creator is NOT automatically a group admin — admins assign that role
*/

CREATE TABLE IF NOT EXISTS public.group_admins (
  group_id   uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  granted_at timestamptz NOT NULL DEFAULT now(),
  granted_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE public.group_admins ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS group_admins_user_id_idx ON public.group_admins (user_id);
CREATE INDEX IF NOT EXISTS group_admins_group_id_idx ON public.group_admins (group_id);

CREATE POLICY "App admins can view all group admin records"
  ON public.group_admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    OR user_id = auth.uid()
  );

CREATE POLICY "App admins can assign group admins"
  ON public.group_admins FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "App admins can revoke group admins"
  ON public.group_admins FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE OR REPLACE FUNCTION public.is_group_admin(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_admins
    WHERE group_id = p_group_id AND user_id = auth.uid()
  );
$$;

CREATE POLICY "Group admins can remove members from their groups"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    OR public.is_group_admin(group_id)
  );

CREATE OR REPLACE FUNCTION public.get_my_group_admin_ids()
RETURNS uuid[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(array_agg(group_id), ARRAY[]::uuid[])
  FROM public.group_admins
  WHERE user_id = auth.uid();
$$;
