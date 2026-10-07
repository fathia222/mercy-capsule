-- FILE: supabase-setup.sql
-- Run this once: Supabase dashboard > SQL Editor > New query > paste > Run

-- 1. The table that stores every memory
create table public.memories (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 80),
  relationship text,
  message     text check (char_length(message) <= 5000),
  memory      text check (char_length(memory)  <= 5000),
  story       text check (char_length(story)   <= 10000),
  photos      text[] not null default '{}'
);

-- 2. Lock it down: visitors can ADD a memory but can never READ any.
--    (No select policy exists, so the public key cannot read the table.
--     Your secret server key bypasses this, which is how her page reads them.)
alter table public.memories enable row level security;

create policy "anyone can add a memory"
  on public.memories for insert to anon
  with check (true);

-- 3. Storage bucket for photos (public links, 5 MB max, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "anyone can upload photos"
  on storage.objects for insert to anon
  with check (bucket_id = 'photos');