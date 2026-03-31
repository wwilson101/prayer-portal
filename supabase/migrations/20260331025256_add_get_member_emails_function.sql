/*
  # Add get_member_emails function

  Returns the email addresses of all users who share at least one group
  with the currently authenticated user. This allows prayer cards to
  display the owner's contact email without exposing all auth.users data.

  1. New Functions
    - `get_member_emails()` - returns table of (user_id uuid, email text)
      for all group co-members of the calling user
*/

CREATE OR REPLACE FUNCTION get_member_emails()
RETURNS TABLE(user_id uuid, email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT au.id AS user_id, au.email
  FROM auth.users au
  WHERE au.id IN (
    SELECT gm.user_id
    FROM group_members gm
    WHERE gm.group_id IN (
      SELECT gm2.group_id
      FROM group_members gm2
      WHERE gm2.user_id = auth.uid()
    )
  );
END;
$$;
