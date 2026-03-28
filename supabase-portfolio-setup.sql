-- ============================================================
--  Iskandar Home — Supabase Setup SQL  (to'liq versiya)
--  Supabase Dashboard > SQL Editor ga nusxa ko'chirib ishga tushiring
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. JADVAL: categories  (dinamik kategoriyalar)
-- ────────────────────────────────────────────────────────────

create table if not exists public.categories (
  id          uuid        primary key default gen_random_uuid(),
  slug        text        unique not null,
  name_uz     text        not null,
  name_ru     text        not null,
  desc_uz     text        not null default '',
  desc_ru     text        not null default '',
  sort_order  int         not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- 2. JADVAL: portfolio_images
-- ────────────────────────────────────────────────────────────

create table if not exists public.portfolio_images (
  id           uuid        primary key default gen_random_uuid(),
  title        text,
  product_name text,       -- JSON: {"uz":"...","ru":"..."} yoki oddiy matn
  price        numeric,
  image_url    text        not null,
  category     text,       -- categories.slug ga havola
  created_at   timestamptz not null default now()
);

-- Agar jadval allaqachon mavjud bo'lsa — ustunlarni qo'shish
alter table public.portfolio_images add column if not exists product_name text;
alter table public.portfolio_images add column if not exists price        numeric;
alter table public.portfolio_images add column if not exists category     text;

-- ────────────────────────────────────────────────────────────
-- 3. RLS — yoqish
-- ────────────────────────────────────────────────────────────

alter table public.categories        enable row level security;
alter table public.portfolio_images  enable row level security;

-- ────────────────────────────────────────────────────────────
-- 4. RLS POLICY'LAR: categories
-- ────────────────────────────────────────────────────────────

drop policy if exists "Public can read categories"           on public.categories;
drop policy if exists "Authenticated can insert categories"  on public.categories;
drop policy if exists "Authenticated can update categories"  on public.categories;
drop policy if exists "Authenticated can delete categories"  on public.categories;

create policy "Public can read categories"
  on public.categories for select to anon, authenticated using (true);

create policy "Authenticated can insert categories"
  on public.categories for insert to authenticated with check (true);

create policy "Authenticated can update categories"
  on public.categories for update to authenticated using (true) with check (true);

create policy "Authenticated can delete categories"
  on public.categories for delete to authenticated using (true);

-- ────────────────────────────────────────────────────────────
-- 5. RLS POLICY'LAR: portfolio_images
-- ────────────────────────────────────────────────────────────

drop policy if exists "Public can read portfolio images"         on public.portfolio_images;
drop policy if exists "Authenticated can insert portfolio images" on public.portfolio_images;
drop policy if exists "Authenticated can update portfolio images" on public.portfolio_images;
drop policy if exists "Authenticated can delete portfolio images" on public.portfolio_images;

create policy "Public can read portfolio images"
  on public.portfolio_images for select to anon, authenticated using (true);

create policy "Authenticated can insert portfolio images"
  on public.portfolio_images for insert to authenticated with check (true);

create policy "Authenticated can update portfolio images"
  on public.portfolio_images for update to authenticated using (true) with check (true);

create policy "Authenticated can delete portfolio images"
  on public.portfolio_images for delete to authenticated using (true);

-- ────────────────────────────────────────────────────────────
-- 6. STORAGE BUCKET: portfolio
-- ────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

-- ────────────────────────────────────────────────────────────
-- 7. STORAGE POLICY'LAR
-- ────────────────────────────────────────────────────────────

drop policy if exists "Public can view portfolio files"         on storage.objects;
drop policy if exists "Authenticated can upload portfolio files" on storage.objects;
drop policy if exists "Authenticated can update portfolio files" on storage.objects;
drop policy if exists "Authenticated can delete portfolio files" on storage.objects;

create policy "Public can view portfolio files"
  on storage.objects for select to anon, authenticated using (bucket_id = 'portfolio');

create policy "Authenticated can upload portfolio files"
  on storage.objects for insert to authenticated with check (bucket_id = 'portfolio');

create policy "Authenticated can update portfolio files"
  on storage.objects for update to authenticated
  using (bucket_id = 'portfolio') with check (bucket_id = 'portfolio');

create policy "Authenticated can delete portfolio files"
  on storage.objects for delete to authenticated using (bucket_id = 'portfolio');

-- ────────────────────────────────────────────────────────────
-- 8. DEFAULT KATEGORIYALAR (11 ta)
-- ────────────────────────────────────────────────────────────

insert into public.categories (slug, name_uz, name_ru, desc_uz, desc_ru, sort_order) values
  ('kitchens',       'Oshxonalar',           'Кухни',               'Zamonaviy va klassik oshxona mebellari',        'Современные и классические кухни',          1),
  ('hallways',       'Kirish zallari',        'Прихожие',            'Qulay va chiroyli kirish hall mebellari',       'Удобные и стильные прихожие',               2),
  ('bedrooms',       'Yotoq xonalari',        'Спальни',             'Dam olish uchun qulay va zamonaviy yotoqlar',   'Уютные и современные спальни',              3),
  ('kids',           'Bolalar mebeli',        'Детская мебель',      'Xavfsiz va rang-barang bolalar mebellari',      'Безопасная и яркая детская мебель',         4),
  ('wardrobes',      'Kupeli shkaflar',       'Шкафы-купе',          'Keng va funksional kupeli shkaflar',            'Просторные и функциональные шкафы-купе',    5),
  ('dressing-rooms', 'Kiyim xonalari',        'Гардеробные',         'Individual loyihalangan kiyim xonalari',        'Индивидуально спроектированные гардеробные',6),
  ('stairs',         'Zinapoyalar',           'Лестницы',            'Shpon va yog''ochdan zinapoya va boshqalar',    'Лестницы из шпона и дерева',                7),
  ('doors',          'Eshiklar',              'Двери',               'Yog''och va MDF eshiklar, individual dizayn',   'Деревянные и МДФ двери, индивидуальный дизайн',8),
  ('panels',         'Panno',                 'Панно',               'Devor bezaklari va panno ishlar',               'Настенные украшения и панно',               9),
  ('cladding',       'Qoplamalar',            'Обшивки',             'Sifatli devor va shift qoplamalari',            'Качественные обшивки стен и потолков',      10),
  ('wood-products',  'Yog''och mahsulotlar',  'Изделия из дерева',  'Har xil yog''och buyumlar va bezaklar',          'Различные деревянные изделия и декор',      11)
on conflict (slug) do update set
  name_uz    = excluded.name_uz,
  name_ru    = excluded.name_ru,
  desc_uz    = excluded.desc_uz,
  desc_ru    = excluded.desc_ru,
  sort_order = excluded.sort_order,
  is_active  = true;

-- ────────────────────────────────────────────────────────────
-- 9. INDEKSLAR
-- ────────────────────────────────────────────────────────────

create index if not exists idx_categories_slug
  on public.categories (slug);

create index if not exists idx_categories_sort
  on public.categories (sort_order) where is_active = true;

create index if not exists idx_portfolio_images_category
  on public.portfolio_images (category);

create index if not exists idx_portfolio_images_created_at
  on public.portfolio_images (created_at desc);

-- ────────────────────────────────────────────────────────────
-- 10. TEKSHIRISH
-- ────────────────────────────────────────────────────────────
-- select slug, name_uz, name_ru, sort_order from public.categories order by sort_order;
-- select count(*) from public.portfolio_images;
