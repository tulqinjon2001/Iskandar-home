-- Materiallar va katalog mahsulotlarini ajratish.
-- Supabase SQL Editor da bir marta ishga tushiring.

alter table public.portfolio_images
  add column if not exists is_material boolean not null default false;

comment on column public.portfolio_images.is_material is
  'true = faqat bosh sahifadagi Materiallar; false = katalog (xizmat kategoriyasi bo‘yicha)';
