import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { PortfolioImage } from '../types';

export function usePortfolioImages() {
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);

  const fetchPortfolioImages = async () => {
    if (!supabase) {
      setLoadingPortfolio(false);
      return;
    }

    setLoadingPortfolio(true);
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('id,title,product_name,price,image_url,created_at,category')
      .order('created_at', { ascending: false });

    if (error) {
      const { data: fallbackData } = await supabase
        .from('portfolio_images')
        .select('id,title,image_url,created_at')
        .order('created_at', { ascending: false });

      const mapped = ((fallbackData as Omit<PortfolioImage, 'category'>[] | null) ?? []).map(
        (item) => ({ ...item, product_name: item.title, price: null, category: null }),
      );
      setPortfolioImages(mapped);
      setLoadingPortfolio(false);
      return;
    }

    setPortfolioImages((data as PortfolioImage[] | null) ?? []);
    setLoadingPortfolio(false);
  };

  useEffect(() => {
    void fetchPortfolioImages();
  }, []);

  const getImagesByCategory = (slug: string) =>
    portfolioImages.filter((item) => item.category === slug);

  return { portfolioImages, loadingPortfolio, fetchPortfolioImages, getImagesByCategory };
}
