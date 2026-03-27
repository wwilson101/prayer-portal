-- ============================================================
-- PRAYER PORTAL — Supabase Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- PROFILES
-- One row per user, linked to auth.users
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  phone       text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id);


-- ============================================================
-- GROUPS
-- ============================================================
create table public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  code        text not null unique,
  created_by  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

alter table public.groups enable row level security;

create policy "Groups viewable by authenticated users"
  on public.groups for select to authenticated using (true);

create policy "Authenticated users can create groups"
  on public.groups for insert to authenticated
  with check (auth.uid() = created_by);

create policy "Creator can update group"
  on public.groups for update to authenticated
  using (auth.uid() = created_by);

create policy "Creator can delete group"
  on public.groups for delete to authenticated
  using (auth.uid() = created_by);


-- ============================================================
-- GROUP_MEMBERS
-- ============================================================
create table public.group_members (
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "Members can view their groups member lists"
  on public.group_members for select to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy "Users can join groups"
  on public.group_members for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can leave groups"
  on public.group_members for delete to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- PRAYERS
-- ============================================================
create table public.prayers (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  request        text not null,
  request_date   timestamptz not null default now(),
  status         text not null default 'active' check (status in ('active', 'answered')),
  answered_date  timestamptz,
  answered_note  text,
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  created_at     timestamptz not null default now()
);

alter table public.prayers enable row level security;

create policy "Prayers visible to prayer group members"
  on public.prayers for select to authenticated
  using (
    owner_id = auth.uid()
    or exists (
      select 1
      from public.prayer_groups pg
      join public.group_members gm on gm.group_id = pg.group_id
      where pg.prayer_id = prayers.id
        and gm.user_id = auth.uid()
    )
  );

create policy "Owner can insert prayer"
  on public.prayers for insert to authenticated
  with check (auth.uid() = owner_id);

create policy "Owner can update prayer"
  on public.prayers for update to authenticated
  using (auth.uid() = owner_id);

create policy "Owner can delete prayer"
  on public.prayers for delete to authenticated
  using (auth.uid() = owner_id);


-- ============================================================
-- PRAYER_GROUPS  (prayer ↔ group many-to-many)
-- ============================================================
create table public.prayer_groups (
  prayer_id   uuid not null references public.prayers(id) on delete cascade,
  group_id    uuid not null references public.groups(id) on delete cascade,
  primary key (prayer_id, group_id)
);

alter table public.prayer_groups enable row level security;

create policy "Group members can view prayer_groups"
  on public.prayer_groups for select to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = prayer_groups.group_id
        and gm.user_id = auth.uid()
    )
  );

create policy "Prayer owner can insert prayer_groups"
  on public.prayer_groups for insert to authenticated
  with check (
    exists (
      select 1 from public.prayers p
      where p.id = prayer_groups.prayer_id and p.owner_id = auth.uid()
    )
  );

create policy "Prayer owner can delete prayer_groups"
  on public.prayer_groups for delete to authenticated
  using (
    exists (
      select 1 from public.prayers p
      where p.id = prayer_groups.prayer_id and p.owner_id = auth.uid()
    )
  );


-- ============================================================
-- PRAYER_PRAYS  (who has prayed for each prayer)
-- ============================================================
create table public.prayer_prays (
  prayer_id   uuid not null references public.prayers(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  prayed_at   timestamptz not null default now(),
  primary key (prayer_id, user_id)
);

alter table public.prayer_prays enable row level security;

create policy "Group members can see prayer_prays"
  on public.prayer_prays for select to authenticated
  using (
    exists (
      select 1
      from public.prayer_groups pg
      join public.group_members gm on gm.group_id = pg.group_id
      where pg.prayer_id = prayer_prays.prayer_id
        and gm.user_id = auth.uid()
    )
  );

create policy "Users can record their own pray"
  on public.prayer_prays for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove their own pray"
  on public.prayer_prays for delete to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- RPC: get_my_profile
-- Returns current user's profile + email from auth.users
-- ============================================================
create or replace function public.get_my_profile()
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'id',        p.id,
    'name',      p.name,
    'email',     u.email,
    'phone',     p.phone,
    'createdAt', p.created_at
  )
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = auth.uid();
$$;


-- ============================================================
-- RPC: join_group_by_code
-- Atomic lookup + insert — returns { success, message?, groupId? }
-- ============================================================
create or replace function public.join_group_by_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group   public.groups%rowtype;
  v_already boolean;
begin
  select * into v_group
  from public.groups
  where upper(code) = upper(p_code)
  limit 1;

  if not found then
    return json_build_object('success', false, 'message', 'Group not found. Check the code and try again.');
  end if;

  select exists(
    select 1 from public.group_members
    where group_id = v_group.id and user_id = auth.uid()
  ) into v_already;

  if v_already then
    return json_build_object('success', false, 'message', 'You''re already in this group!');
  end if;

  insert into public.group_members (group_id, user_id)
  values (v_group.id, auth.uid());

  return json_build_object('success', true, 'groupId', v_group.id);
end;
$$;


-- ============================================================
-- INDEXES
-- ============================================================
create index on public.prayers (owner_id);
create index on public.prayers (status);
create index on public.prayer_groups (group_id);
create index on public.prayer_groups (prayer_id);
create index on public.group_members (user_id);
create index on public.group_members (group_id);
create index on public.prayer_prays (prayer_id);
create index on public.groups (upper(code));
