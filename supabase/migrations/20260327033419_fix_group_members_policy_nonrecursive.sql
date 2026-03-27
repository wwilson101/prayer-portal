/*
  # Fix group_members SELECT policy - use security definer function

  The group_members policy cannot use a subquery on group_members without
  causing recursion. The solution is a SECURITY DEFINER function that bypasses
  RLS to check membership, breaking the recursion.
*/

DROP POLICY IF EXISTS "Members or admins can view group members" ON public.group_members;

CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = (select auth.uid())
  );
$$;

CREATE POLICY "Members or admins can view group members"
  ON public.group_members FOR SELECT TO authenticated
  USING (
    public.is_group_member(group_id)
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true
    )
  );
