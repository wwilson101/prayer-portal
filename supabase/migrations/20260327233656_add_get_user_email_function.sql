/*
  # Add admin function to retrieve user email

  ## Summary
  Creates a security-definer function that allows admins to look up a user's
  email address from auth.users. This is required because auth.users is not
  directly accessible from the client.

  ## New Functions
  - `admin_get_user_email(user_id uuid)` — returns the email for the given
    user ID; only callable by authenticated admins (checked via profiles table).
*/

CREATE OR REPLACE FUNCTION admin_get_user_email(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_is_admin boolean;
  user_email text;
BEGIN
  SELECT is_admin INTO caller_is_admin
  FROM profiles
  WHERE id = auth.uid();

  IF NOT COALESCE(caller_is_admin, false) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id;

  RETURN user_email;
END;
$$;
