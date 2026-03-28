/** Dinamik kategoriya slug'i — endi cheklanmagan string */
export type ServiceCategoryKey = string;

export type Category = {
  id: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  desc_uz?: string;
  desc_ru?: string;
  sort_order: number;
  is_active?: boolean;
};

export type PortfolioImage = {
  id: string;
  title: string | null;
  product_name: string | null;
  price: number | null;
  image_url: string;
  created_at: string;
  category: string | null;
};
