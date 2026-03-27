export type ServiceCategoryKey = 'doors' | 'windows' | 'stairs' | 'furniture' | 'flooring' | 'metal';

export type PortfolioImage = {
  id: string;
  title: string | null;
  product_name: string | null;
  price: number | null;
  image_url: string;
  created_at: string;
  category: ServiceCategoryKey | null;
};

export type ServiceCategory = {
  key: ServiceCategoryKey;
  title: string;
  desc: string;
  img: string;
};
