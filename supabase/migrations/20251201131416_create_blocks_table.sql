create table if not exists public.blocks (
  id uuid not null default gen_random_uuid (),
  blocker_id uuid not null references profiles (id) on delete cascade,
  blocked_id uuid not null references profiles (id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  constraint blocks_pkey primary key (id),
  constraint blocks_blocker_id_blocked_id_key unique (blocker_id, blocked_id)
);

alter table public.blocks enable row level security;

create policy "Users can view their own blocks" on public.blocks
  for select
  using (auth.uid() = blocker_id);

create policy "Users can create their own blocks" on public.blocks
  for insert
  with check (auth.uid() = blocker_id);

create policy "Users can delete their own blocks" on public.blocks
  for delete
  using (auth.uid() = blocker_id);
