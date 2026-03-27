/*
  # Update add_prayer_with_groups to support notify_on_pray

  Adds an optional `p_notify_on_pray` parameter to the function so the
  prayer owner can opt in to SMS notifications when creating a prayer.
*/

CREATE OR REPLACE FUNCTION public.add_prayer_with_groups(
  p_title         text,
  p_request       text,
  p_group_ids     uuid[],
  p_notify_on_pray boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_prayer  prayers%ROWTYPE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(p_group_ids) AS gid
    WHERE NOT EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = gid AND gm.user_id = v_user_id
    )
  ) THEN
    RAISE EXCEPTION 'User is not a member of one or more specified groups';
  END IF;

  INSERT INTO prayers (title, request, owner_id, notify_on_pray)
  VALUES (p_title, p_request, v_user_id, p_notify_on_pray)
  RETURNING * INTO v_prayer;

  IF array_length(p_group_ids, 1) > 0 THEN
    INSERT INTO prayer_groups (prayer_id, group_id)
    SELECT v_prayer.id, unnest(p_group_ids);
  END IF;

  RETURN json_build_object(
    'id',              v_prayer.id,
    'title',           v_prayer.title,
    'request',         v_prayer.request,
    'request_date',    v_prayer.request_date,
    'status',          v_prayer.status,
    'owner_id',        v_prayer.owner_id,
    'notify_on_pray',  v_prayer.notify_on_pray
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_prayer_with_groups(text, text, uuid[], boolean) TO authenticated;
