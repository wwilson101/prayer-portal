/*
  # Allow Group Owners and Group Admins to Delete Prayers in Their Groups

  ## Summary
  Adds a new RLS DELETE policy on the `prayers` table so that:
  - Group owners (users who created a group) can delete any prayer shared in that group
  - Group admins (users in the group_admins table for a group) can delete any prayer shared in that group

  ## Changes
  - New DELETE policy on `prayers` table: "Group owners and admins can delete prayers in their groups"

  ## Security Notes
  - Policy checks that the deleting user is either the creator of a group or an appointed group admin
    for at least one group the prayer belongs to
  - Only applies to prayers that are linked via prayer_groups to those groups
  - Existing policies (owner delete, site admin delete) remain unchanged
*/

CREATE POLICY "Group owners and admins can delete prayers in their groups"
  ON public.prayers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.prayer_groups pg
      JOIN public.groups g ON g.id = pg.group_id
      WHERE pg.prayer_id = prayers.id
        AND (
          g.created_by = (SELECT auth.uid())
          OR public.is_group_admin(g.id)
        )
    )
  );
