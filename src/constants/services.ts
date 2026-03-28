import type { Category } from '../types';

/** Supabase yuklanmagan yoki bo'sh bo'lsa ishlatiladi */
export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1',  slug: 'kitchens',       name_uz: 'Oshxonalar',          name_ru: 'Кухни',                desc_uz: 'Zamonaviy va klassik oshxona mebellari',       desc_ru: 'Современные и классические кухни',           sort_order: 1  },
  { id: '2',  slug: 'hallways',       name_uz: 'Kirish zallari',       name_ru: 'Прихожие',             desc_uz: 'Qulay va chiroyli kirish hall mebellari',      desc_ru: 'Удобные и стильные прихожие',                sort_order: 2  },
  { id: '3',  slug: 'bedrooms',       name_uz: 'Yotoq xonalari',       name_ru: 'Спальни',              desc_uz: 'Dam olish uchun qulay va zamonaviy yotoqlar',  desc_ru: 'Уютные и современные спальни',               sort_order: 3  },
  { id: '4',  slug: 'kids',           name_uz: 'Bolalar mebeli',       name_ru: 'Детская мебель',       desc_uz: 'Xavfsiz va rang-barang bolalar mebellari',     desc_ru: 'Безопасная и яркая детская мебель',          sort_order: 4  },
  { id: '5',  slug: 'wardrobes',      name_uz: 'Kupeli shkaflar',      name_ru: 'Шкафы-купе',           desc_uz: 'Keng va funksional kupeli shkaflar',           desc_ru: 'Просторные и функциональные шкафы-купе',     sort_order: 5  },
  { id: '6',  slug: 'dressing-rooms', name_uz: 'Kiyim xonalari',       name_ru: 'Гардеробные',          desc_uz: 'Individual loyihalangan kiyim xonalari',       desc_ru: 'Индивидуально спроектированные гардеробные', sort_order: 6  },
  { id: '7',  slug: 'stairs',         name_uz: 'Zinapoyalar',          name_ru: 'Лестницы',             desc_uz: "Shpon va yog'ochdan zinapoyalar",              desc_ru: 'Лестницы из шпона и дерева',                 sort_order: 7  },
  { id: '8',  slug: 'doors',          name_uz: 'Eshiklar',             name_ru: 'Двери',                desc_uz: "Yog'och va MDF eshiklar, individual dizayn",   desc_ru: 'Деревянные и МДФ двери, индивидуальный дизайн', sort_order: 8 },
  { id: '9',  slug: 'panels',         name_uz: 'Panno',                name_ru: 'Панно',                desc_uz: 'Devor bezaklari va panno ishlar',              desc_ru: 'Настенные украшения и панно',                sort_order: 9  },
  { id: '10', slug: 'cladding',       name_uz: 'Qoplamalar',           name_ru: 'Обшивки',              desc_uz: 'Sifatli devor va shift qoplamalari',           desc_ru: 'Качественные обшивки стен и потолков',       sort_order: 10 },
  { id: '11', slug: 'wood-products',  name_uz: "Yog'och mahsulotlar",  name_ru: 'Изделия из дерева',    desc_uz: "Har xil yog'och buyumlar va bezaklar",         desc_ru: 'Различные деревянные изделия и декор',       sort_order: 11 },
];

export function getCategoryName(cat: Category, lang: 'uz' | 'ru'): string {
  return lang === 'ru' ? cat.name_ru : cat.name_uz;
}

export function getCategoryDesc(cat: Category, lang: 'uz' | 'ru'): string {
  return lang === 'ru' ? (cat.desc_ru ?? '') : (cat.desc_uz ?? '');
}

/** Eski kod uchun stub — artiq ishlatilmaydi */
export const SERVICES = DEFAULT_CATEGORIES.map((c) => ({
  key: c.slug,
  title: c.name_uz,
  desc: c.desc_uz ?? '',
  img: `/service_${c.slug}.jpg`,
}));

/** Eski SERVICE_KEYS mos kelish uchun */
export const SERVICE_KEYS = new Set(DEFAULT_CATEGORIES.map((c) => c.slug));
