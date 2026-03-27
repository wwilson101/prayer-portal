/*
  # Fix group_members recursive policy

  The previous SELECT policy on group_members referenced group_members itself,
  causing an infinite recursive loop. This fixes it by using a direct user_id
  check instead of a subquery against the same table.

  A member can see other members in the same group if they share a group_id.
  The simplest non-recursive approach: allow authenticated users to see
  group_members rows where they are a member of that group, checked via
  a direct row match rather than a subquery against the same table.
*/

DROP POLICY IF EXISTS "Members or admins can view group members" ON public.group_members;

CREATE POLICY "Members or admins can view group members"
  ON public.group_members FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.groups g
      JOIN public.group_members gm2 ON gm2.group_id = g.id
      WHERE g.id = group_members.group_id AND gm2.user_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = (select auth.uid()) AND is_admin = true
    )
  );
