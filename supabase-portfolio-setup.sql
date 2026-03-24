-- 1) Table for portfolio images
create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 2) Enable RLS
alter table public.portfolio_images enable row level security;

-- 3) Public can read portfolio images
drop policy if exists "Public can read portfolio images" on public.portfolio_images;
create policy "Public can read portfolio images"
on public.portfolio_images
for select
to anon, authenticated
using (true);

-- 4) Only authenticated users can insert
drop policy if exists "Authenticated can insert portfolio images" on public.portfolio_images;
create policy "Authenticated can insert portfolio images"
on public.portfolio_images
for insert
to authenticated
with check (true);

-- 5) Storage bucket for portfolio images
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

-- 6) Storage policies
drop policy if exists "Public can view portfolio files" on storage.objects;
create policy "Public can view portfolio files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'portfolio');

drop policy if exists "Authenticated can upload portfolio files" on storage.objects;
create policy "Authenticated can upload portfolio files"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'portfolio');
