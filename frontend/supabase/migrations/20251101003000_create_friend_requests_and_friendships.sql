-- Ensure required extensions
create extension if not exists pgcrypto;

-- Create friendships table if it doesn't exist
create table if not exists public.friendships (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  primary key (follower_id, following_id)
);

alter table public.friendships enable row level security;

-- Policies for friendships
do $$ begin
  begin
    drop policy if exists "friendships_select" on public.friendships;
  exception when undefined_object then null; end;
  create policy "friendships_select" on public.friendships
    for select using (follower_id = auth.uid() or following_id = auth.uid());

  begin
    drop policy if exists "friendships_insert" on public.friendships;
  exception when undefined_object then null; end;
  create policy "friendships_insert" on public.friendships
    for insert with check (follower_id = auth.uid());

  begin
    drop policy if exists "friendships_delete" on public.friendships;
  exception when undefined_object then null; end;
  create policy "friendships_delete" on public.friendships
    for delete using (follower_id = auth.uid() or following_id = auth.uid());
end $$;

-- Create friend_requests table if it doesn't exist
create table if not exists public.friend_requests (
  id uuid not null default gen_random_uuid() primary key,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamp with time zone not null default now()
);

-- Prevent duplicate pending requests in same direction
create unique index if not exists friend_requests_unique_pending
  on public.friend_requests (sender_id, recipient_id)
  where status = 'pending';

alter table public.friend_requests enable row level security;

-- Policies for friend_requests
-- Users can select requests where they are sender or recipient
DO $$ BEGIN
  BEGIN
    DROP POLICY IF EXISTS "select_own_requests" ON public.friend_requests;
  EXCEPTION WHEN undefined_object THEN NULL; END;
  CREATE POLICY "select_own_requests" ON public.friend_requests
    FOR SELECT
    USING (sender_id = auth.uid() OR recipient_id = auth.uid());

  BEGIN
    DROP POLICY IF EXISTS "insert_own_requests" ON public.friend_requests;
  EXCEPTION WHEN undefined_object THEN NULL; END;
  CREATE POLICY "insert_own_requests" ON public.friend_requests
    FOR INSERT
    WITH CHECK (sender_id = auth.uid());

  BEGIN
    DROP POLICY IF EXISTS "update_as_recipient" ON public.friend_requests;
  EXCEPTION WHEN undefined_object THEN NULL; END;
  CREATE POLICY "update_as_recipient" ON public.friend_requests
    FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

  BEGIN
    DROP POLICY IF EXISTS "delete_own_pending_request" ON public.friend_requests;
  EXCEPTION WHEN undefined_object THEN NULL; END;
  CREATE POLICY "delete_own_pending_request" ON public.friend_requests
    FOR DELETE
    USING (sender_id = auth.uid() AND status = 'pending');
END $$;