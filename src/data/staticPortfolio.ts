import type { PortfolioImage } from '../types';

/**
 * Supabase (.env da URL/KEY bo‘lmasa) sayt shu ro‘yxatdan foydalanadi.
 *
 * Qanday qo‘shish:
 * - Rasmlarni `public/` ga qo‘ying, masalan `public/catalog/oshxona-1.jpg` → image_url: `/catalog/oshxona-1.jpg`
 * - Katalog mahsuloti: category = `kitchens` | `hallways` | ... (slug), is_material: false yoki undefined
 * - Material: is_material: true yoki category: `_iskandar_materials` (maxfiy slug)
 * - Nom: product_name JSON — {"uz":"...","ru":"..."}
 * - id: har birida noyob matn, masalan `local-1`
 */

export const STATIC_PORTFOLIO_IMAGES: PortfolioImage[] = [
  // Namuna (o‘chirish yoki o‘zgartirish mumkin):
  // {
  //   id: 'local-demo-1',
  //   title: null,
  //   product_name: JSON.stringify({ uz: 'Namuna mahsulot', ru: 'Пример товара' }),
  //   price: 1500000,
  //   image_url: '/logo/logo.jpg',
  //   created_at: new Date().toISOString(),
  //   category: 'kitchens',
  //   is_material: false,
  // },
];
