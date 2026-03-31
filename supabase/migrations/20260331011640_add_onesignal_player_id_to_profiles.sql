/*
  # Add OneSignal Player ID to Profiles

  ## Changes
  - Adds `onesignal_player_id` column to the `profiles` table
  - This stores each user's OneSignal subscription ID for push notifications
  - Column is nullable since users may not have granted push permission

  ## Security
  - Users can only update their own player_id via existing RLS policies on profiles
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onesignal_player_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onesignal_player_id text DEFAULT NULL;
  END IF;
END $$;
