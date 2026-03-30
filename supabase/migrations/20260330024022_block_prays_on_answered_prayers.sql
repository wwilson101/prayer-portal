/*
  # Block prays on answered prayers

  Adds a check constraint so no one can insert into prayer_prays
  for a prayer that is already marked as answered.

  1. Changes
    - Drops and recreates the INSERT policy on prayer_prays to require
      the related prayer has status = 'active'
*/

DROP POLICY IF EXISTS "Members can pray for prayers in their groups" ON prayer_prays;

CREATE POLICY "Members can pray for active prayers in their groups"
  ON prayer_prays
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM prayers
      WHERE prayers.id = prayer_id
      AND prayers.status = 'active'
    )
    AND EXISTS (
      SELECT 1 FROM prayer_groups pg
      JOIN group_members gm ON gm.group_id = pg.group_id
      WHERE pg.prayer_id = prayer_prays.prayer_id
      AND gm.user_id = auth.uid()
    )
  );
