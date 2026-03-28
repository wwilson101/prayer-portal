/*
  # Update get_my_profile to include admin info

  ## Changes
  - Updates `get_my_profile()` RPC to include:
    - `isAdmin` (bool) — whether the user is an app admin
    - `groupAdminIds` (uuid[]) — array of group IDs the user is a group admin for

  ## Notes
  1. The frontend uses this to conditionally show admin controls
  2. Group admin IDs are used to show management controls in the Groups screen
*/

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'id',             p.id,
    'name',           p.name,
    'email',          u.email,
    'phone',          p.phone,
    'createdAt',      p.created_at,
    'isAdmin',        p.is_admin,
    'groupAdminIds',  COALESCE(
                        (SELECT array_agg(ga.group_id)
                         FROM public.group_admins ga
                         WHERE ga.user_id = p.id),
                        ARRAY[]::uuid[]
                      )
  )
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
$$;
