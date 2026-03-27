/*
  # Restrict group creation to admins only

  ## Changes
  - Drops the existing INSERT policy on `groups` that allows any authenticated user to create groups
  - Adds a new INSERT policy that only permits users with `is_admin = true` in their profile to create groups

  ## Security
  - Non-admin users will receive a permission denied error if they attempt to insert into the groups table
*/

DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;

CREATE POLICY "Only admins can create groups"
  ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
    )
  );
