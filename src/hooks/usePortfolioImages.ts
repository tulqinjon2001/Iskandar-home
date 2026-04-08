import { useState, useEffect } from 'react';
import { STATIC_PORTFOLIO_IMAGES } from '../data/staticPortfolio';
import { supabase } from '../lib/supabase';
import { isPortfolioMaterialRow } from '../utils/portfolioRow';
import type { PortfolioImage } from '../types';

function normalizeFetchedRows(rows: PortfolioImage[]): PortfolioImage[] {
  return rows.map((item) => ({
    ...item,
    is_material: isPortfolioMaterialRow(item),
  }));
}

export function usePortfolioImages() {
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  const fetchPortfolioImages = async () => {
    if (!supabase) {
      setPortfolioImages(
        STATIC_PORTFOLIO_IMAGES.map((row) => ({
          ...row,
          is_material: Boolean(row.is_material),
        })),
      );
      setLoadingPortfolio(false);
      return;
    }

    setLoadingPortfolio(true);
    /** `*` — jadvalda `is_material` bo‘lmasa ham 400 bermaydi; aniq `is_material` yozilsa, ustun yo‘q bo‘lsa PostgREST 400 qaytaradi. */
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[usePortfolioImages]', error.message);
      setPortfolioImages([]);
      setLoadingPortfolio(false);
      return;
    }

    const rows = (data as PortfolioImage[] | null) ?? [];
    setPortfolioImages(normalizeFetchedRows(rows));
    setLoadingPortfolio(false);
  };

  useEffect(() => {
    void fetchPortfolioImages();
  }, []);

  /** Katalog: berilgan xizmat kategoriyasidagi mahsulotlar (materiallar emas) */
  const getImagesByCategory = (slug: string) =>
    portfolioImages.filter(
      (item) => !isPortfolioMaterialRow(item) && item.category === slug,
    );

  /** Bosh sahifa «Materiallar» ro'yxati */
  const getMaterialImages = () => portfolioImages.filter((item) => isPortfolioMaterialRow(item));

  return {
    portfolioImages,
    loadingPortfolio,
    fetchPortfolioImages,
    getImagesByCategory,
    getMaterialImages,
  };
}
