/*
  # Fix indexes and performance issues

  ## Changes
  1. Add covering index on `group_members.user_id` (foreign key without index)
  2. Add covering index on `prayers.owner_id` (foreign key without index)
  3. Drop unused index `groups_created_by_idx`
  4. Drop unused index `prayer_prays_user_id_idx`

  ## Notes
  - The composite primary key on group_members (group_id, user_id) only covers group_id lookups.
    A separate index on user_id is needed for efficient reverse lookups.
  - prayers.owner_id has no index at all, causing full table scans on ownership queries.
  - The two dropped indexes have never been used and add unnecessary write overhead.
*/

CREATE INDEX IF NOT EXISTS group_members_user_id_idx
  ON public.group_members (user_id);

CREATE INDEX IF NOT EXISTS prayers_owner_id_idx
  ON public.prayers (owner_id);

DROP INDEX IF EXISTS public.groups_created_by_idx;
DROP INDEX IF EXISTS public.prayer_prays_user_id_idx;
