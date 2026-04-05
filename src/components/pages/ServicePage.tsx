import { useState, type MouseEvent } from 'react';
import { usePortfolioImages } from '../../hooks/usePortfolioImages';
import { useCategories } from '../../hooks/useCategories';
import { useLanguage } from '../../contexts/LanguageContext';
import { LangSwitcher } from '../ui/LangSwitcher';
import { OrderModal } from '../ui/OrderModal';
import { parseProductName } from '../../utils/formatters';
import { getCategoryName, getCategoryDesc } from '../../constants/services';
import type { PortfolioImage } from '../../types';

type ServicePageProps = {
  serviceSlug?: string;
};

export function ServicePage({ serviceSlug }: ServicePageProps) {
  const { t, lang } = useLanguage();
  const { loadingPortfolio, getImagesByCategory } = usePortfolioImages();
  const { getCategoryBySlug, loadingCategories } = useCategories();
  const [selectedItem, setSelectedItem] = useState<PortfolioImage | null>(null);

  const cat = serviceSlug ? getCategoryBySlug(serviceSlug) : undefined;

  const formatPrice = (price: number | null) => {
    if (price === null) return t.servicePage.noPriceLabel;
    return `${price.toLocaleString('ru-RU')} ${t.formatters.currency}`;
  };

  if (!loadingCategories && (!serviceSlug || !cat)) {
    return (
      <div className="min-h-screen bg-navy text-white px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl mb-4">{t.servicePage.notFound}</h1>
          <a href="/" className="text-gold underline">{t.servicePage.backHome}</a>
        </div>
      </div>
    );
  }

  if (loadingCategories || !cat) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const categoryImages = getImagesByCategory(cat.slug);

  const goBackToLanding = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="px-6 lg:px-[6vw] py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" onClick={goBackToLanding} className="inline-flex items-center gap-3">
            <img
              src="/logo/logo.jpg"
              alt="Iskandar Home"
              className="h-10 w-10 rounded-sm object-cover ring-1 ring-gold/50"
            />
            <span className="font-display text-xl">Iskandar Home</span>
          </a>
          <div className="flex items-center gap-4">
            <LangSwitcher />
            <a href="/" onClick={goBackToLanding} className="text-sm text-gold uppercase tracking-wider">
              {t.servicePage.backBtn}
            </a>
          </div>
        </div>

        {/* Page title */}
        <div className="max-w-3xl mb-8">
          <h1 className="font-display text-[clamp(34px,4vw,52px)] mb-3">{getCategoryName(cat, lang)}</h1>
          <p className="text-white/70">{getCategoryDesc(cat, lang)}</p>
        </div>

        {/* Grid */}
        {loadingPortfolio ? (
          <div className="text-white/70">{t.servicePage.loading}</div>
        ) : categoryImages.length === 0 ? (
          <div className="glass-card p-6 text-white/70">{t.servicePage.empty}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
            {categoryImages.map((item) => {
              const name = parseProductName(item.product_name ?? item.title, lang) || t.servicePage.noName;
              return (
                <div
                  key={item.id}
                  className="group glass-card flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-2xl hover:shadow-black/45"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="flex min-h-0 flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071a2e]"
                    aria-label={name}
                  >
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-white/[0.06] bg-[#0a1520]">
                      <img
                        src={item.image_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-3 pt-4">
                      <p className="line-clamp-3 text-sm font-medium leading-relaxed text-white/95">{name}</p>
                      <p className="mt-auto pt-3 text-sm font-semibold tabular-nums tracking-tight text-gold">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </button>

                  <div className="shrink-0 px-4 pb-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="btn-gold w-full rounded-sm py-2.5 text-sm font-semibold transition-transform active:translate-y-0"
                    >
                      {t.servicePage.orderBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {selectedItem && (
        <OrderModal
          item={selectedItem}
          formatPrice={formatPrice}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
