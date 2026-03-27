/*
  # Add Prayer with Groups - SECURITY DEFINER Function

  ## Problem
  The `prayer_groups` INSERT RLS policy checks `prayers` via a subquery,
  and the `prayers` SELECT RLS also checks `prayer_groups`. This circular
  dependency can cause RLS evaluation issues when inserting a new prayer
  and immediately linking it to groups.

  ## Solution
  A SECURITY DEFINER function that atomically inserts a prayer and its
  group associations, bypassing the circular RLS issue.

  ## New Functions
  - `add_prayer_with_groups(title, request, group_ids[])` - Creates a prayer
    and links it to groups in one atomic operation. Returns the new prayer row.
    Only the calling authenticated user can create prayers for themselves.
*/

CREATE OR REPLACE FUNCTION public.add_prayer_with_groups(
  p_title    text,
  p_request  text,
  p_group_ids uuid[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_prayer  prayers%ROWTYPE;
  v_gid     uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verify the user is actually a member of all requested groups
  IF EXISTS (
    SELECT 1 FROM unnest(p_group_ids) AS gid
    WHERE NOT EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = gid AND gm.user_id = v_user_id
    )
  ) THEN
    RAISE EXCEPTION 'User is not a member of one or more specified groups';
  END IF;

  -- Insert the prayer
  INSERT INTO prayers (title, request, owner_id)
  VALUES (p_title, p_request, v_user_id)
  RETURNING * INTO v_prayer;

  -- Link to groups
  IF array_length(p_group_ids, 1) > 0 THEN
    INSERT INTO prayer_groups (prayer_id, group_id)
    SELECT v_prayer.id, unnest(p_group_ids);
  END IF;

  RETURN json_build_object(
    'id',            v_prayer.id,
    'title',         v_prayer.title,
    'request',       v_prayer.request,
    'request_date',  v_prayer.request_date,
    'status',        v_prayer.status,
    'owner_id',      v_prayer.owner_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_prayer_with_groups(text, text, uuid[]) TO authenticated;
