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
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('id,title,product_name,price,image_url,created_at,category,is_material')
      .order('created_at', { ascending: false });

    if (error) {
      const { data: fallbackData } = await supabase
        .from('portfolio_images')
        .select('id,title,product_name,price,image_url,created_at,category')
        .order('created_at', { ascending: false });

      const mapped = ((fallbackData as PortfolioImage[] | null) ?? []).map((item) => ({
        ...item,
        product_name: item.product_name ?? item.title,
        price: item.price ?? null,
        is_material: isPortfolioMaterialRow({
          is_material: false,
          category: item.category,
        }),
      }));
      setPortfolioImages(mapped);
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
