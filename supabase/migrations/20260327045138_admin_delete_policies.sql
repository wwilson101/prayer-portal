/*
  # Admin Delete Policies

  ## Summary
  Allows admin users to delete prayers and user profiles from the admin panel.

  ## Changes

  ### Modified Tables
  - `prayers`: Add admin DELETE policy
  - `profiles`: Add admin DELETE policy

  ## Security
  - Only users with `is_admin = true` can use these delete operations
  - Admins cannot delete their own profile (enforced in application layer)
*/

CREATE POLICY "Admins can delete any prayer"
  ON prayers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (SELECT auth.uid()) AND p.is_admin = true
    )
    AND id != (SELECT auth.uid())
  );
