/*
  # Prayer Notifications

  ## Summary
  Adds opt-in SMS notification support to prayer requests. When someone prays
  for a request, the prayer owner receives a one-time SMS if they opted in.
  The notification resets when the prayer is marked as answered so it's ready
  for the next season.

  ## Changes

  ### Modified Tables
  - `prayers`
    - `notify_on_pray` (boolean, default false) — owner opts in to receive SMS when prayed for

  ### New Tables
  - `prayer_notifications_sent`
    - Tracks which users have already triggered an SMS for a given prayer
    - Prevents duplicate notifications per prayer per user
    - Cleared when the prayer is marked as answered (so it resets for next time)

  ## Security
  - RLS enabled on `prayer_notifications_sent`
  - Users can only insert their own notification records
  - Prayer owners can read and delete notification records for their prayers (for reset)
  - Admins can read all records
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'prayers' AND column_name = 'notify_on_pray'
  ) THEN
    ALTER TABLE prayers ADD COLUMN notify_on_pray boolean NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS prayer_notifications_sent (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id   uuid NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sent_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prayer_id, user_id)
);

ALTER TABLE prayer_notifications_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own notification record"
  ON prayer_notifications_sent FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Prayer owner can read notifications for their prayer"
  ON prayer_notifications_sent FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prayers p
      WHERE p.id = prayer_id AND p.owner_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true
    )
  );

CREATE POLICY "Sender can read their own notification records"
  ON prayer_notifications_sent FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Prayer owner can delete notifications to reset"
  ON prayer_notifications_sent FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prayers p
      WHERE p.id = prayer_id AND p.owner_id = (SELECT auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_prayer_notifications_prayer_id ON prayer_notifications_sent(prayer_id);
CREATE INDEX IF NOT EXISTS idx_prayer_notifications_user_id ON prayer_notifications_sent(user_id);
