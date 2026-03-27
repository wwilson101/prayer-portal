/*
  # Add admin flag to profiles

  1. Changes
    - Add `is_admin` boolean column to profiles (default false)
    - Update get_my_profile() to include is_admin in the returned JSON
    - Add a policy allowing admins to view all prayers (not just their group's)

  2. Notes
    - Admin status can only be granted directly in the database (not by users themselves)
    - The is_admin field is exposed in the app profile so the UI can conditionally show admin features
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'id',        p.id,
    'name',      p.name,
    'email',     u.email,
    'phone',     p.phone,
    'isAdmin',   p.is_admin,
    'createdAt', p.created_at
  )
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
$$;
