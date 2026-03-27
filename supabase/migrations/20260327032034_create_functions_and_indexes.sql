/*
  # Create RPC functions and indexes

  1. Functions
    - get_my_profile() - returns current user's profile + email
    - join_group_by_code(p_code) - atomic lookup + insert via invite code

  2. Indexes
    - Performance indexes on all frequently queried foreign keys
*/

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
    'createdAt', p.created_at
  )
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE p.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.join_group_by_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group   public.groups%rowtype;
  v_already boolean;
BEGIN
  SELECT * INTO v_group
  FROM public.groups
  WHERE upper(code) = upper(p_code)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Group not found. Check the code and try again.');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.group_members
    WHERE group_id = v_group.id AND user_id = auth.uid()
  ) INTO v_already;

  IF v_already THEN
    RETURN json_build_object('success', false, 'message', 'You''re already in this group!');
  END IF;

  INSERT INTO public.group_members (group_id, user_id)
  VALUES (v_group.id, auth.uid());

  RETURN json_build_object('success', true, 'groupId', v_group.id);
END;
$$;

CREATE INDEX IF NOT EXISTS prayers_owner_id_idx ON public.prayers (owner_id);
CREATE INDEX IF NOT EXISTS prayers_status_idx ON public.prayers (status);
CREATE INDEX IF NOT EXISTS prayer_groups_group_id_idx ON public.prayer_groups (group_id);
CREATE INDEX IF NOT EXISTS prayer_groups_prayer_id_idx ON public.prayer_groups (prayer_id);
CREATE INDEX IF NOT EXISTS group_members_user_id_idx ON public.group_members (user_id);
CREATE INDEX IF NOT EXISTS group_members_group_id_idx ON public.group_members (group_id);
CREATE INDEX IF NOT EXISTS prayer_prays_prayer_id_idx ON public.prayer_prays (prayer_id);
CREATE INDEX IF NOT EXISTS groups_code_upper_idx ON public.groups (upper(code));
