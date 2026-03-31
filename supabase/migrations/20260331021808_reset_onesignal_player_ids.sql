/*
  # Reset all OneSignal player IDs

  Clears the onesignal_player_id for every user profile so they must
  re-subscribe to push notifications. This is needed after reworking
  the notification permission flow.
*/

UPDATE profiles SET onesignal_player_id = NULL WHERE onesignal_player_id IS NOT NULL;
