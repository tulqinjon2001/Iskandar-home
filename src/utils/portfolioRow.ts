import { LEGACY_MATERIAL_CATEGORY_SLUG } from '../constants/materialsLegacy';
import type { PortfolioImage } from '../types';

/** Katalog kartochkasi emas — «Materiallar» ro'yxatiga kiradi */
export function isPortfolioMaterialRow(item: Pick<PortfolioImage, 'is_material' | 'category'>): boolean {
  return Boolean(item.is_material) || item.category === LEGACY_MATERIAL_CATEGORY_SLUG;
}
