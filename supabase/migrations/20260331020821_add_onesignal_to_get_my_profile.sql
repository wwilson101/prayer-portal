/*
  # Add onesignal_player_id to get_my_profile

  ## Changes
  - Updates `get_my_profile()` RPC to include `onesignalPlayerId`
    so the frontend can use the DB as the source of truth for notification state.
*/

CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'id',                 p.id,
    'name',               p.name,
    'email',              u.email,
    'phone',              p.phone,
    'createdAt',          p.created_at,
    'isAdmin',            p.is_admin,
    'onesignalPlayerId',  p.onesignal_player_id,
    'groupAdminIds',      COALESCE(
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
