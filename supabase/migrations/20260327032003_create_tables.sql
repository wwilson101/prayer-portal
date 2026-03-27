/*
  # Create all Prayer Portal tables (no RLS policies yet)

  Creates: profiles, groups, group_members, prayers, prayer_groups, prayer_prays
*/

CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  phone       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  code        text NOT NULL UNIQUE,
  created_by  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_members (
  group_id    uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.prayers (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text NOT NULL,
  request        text NOT NULL,
  request_date   timestamptz NOT NULL DEFAULT now(),
  status         text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered')),
  answered_date  timestamptz,
  answered_note  text,
  owner_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.prayer_groups (
  prayer_id   uuid NOT NULL REFERENCES public.prayers(id) ON DELETE CASCADE,
  group_id    uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  PRIMARY KEY (prayer_id, group_id)
);

CREATE TABLE IF NOT EXISTS public.prayer_prays (
  prayer_id   uuid NOT NULL REFERENCES public.prayers(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  prayed_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (prayer_id, user_id)
);
