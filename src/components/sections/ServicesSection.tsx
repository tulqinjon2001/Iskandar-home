import { useCallback, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCategories } from "../../hooks/useCategories";
import { usePortfolioImages } from "../../hooks/usePortfolioImages";
import { getCategoryName, getCategoryDesc } from "../../constants/services";
import { parseProductName } from "../../utils/formatters";
import { OrderModal } from "../ui/OrderModal";
import { saveLandingScrollForReturn } from "../../utils/landingScrollRestore";
import type { PortfolioImage } from "../../types";

const GRADIENT_CLASSES = [
  "from-[#1a2c4a] to-[#0f1e35]",
  "from-[#2a1a2e] to-[#1a0f1e]",
  "from-[#1a2a1a] to-[#0f1a0f]",
  "from-[#2a221a] to-[#1a140f]",
  "from-[#1a1a2e] to-[#0f0f1e]",
  "from-[#2a1a1a] to-[#1a0f0f]",
  "from-[#1a2a2a] to-[#0f1a1a]",
  "from-[#2a2a1a] to-[#1a1a0f]",
  "from-[#1e1a2a] to-[#130f1a]",
  "from-[#241a1a] to-[#180f0f]",
  "from-[#1a241a] to-[#0f180f]",
];

type Panel = "catalog" | "materials";

export function ServicesSection() {
  const { t, lang } = useLanguage();
  const { categories, loadingCategories, getCategoryBySlug } = useCategories();
  const { loadingPortfolio, getMaterialImages } = usePortfolioImages();
  const materialImages = getMaterialImages();
  const [panel, setPanelState] = useState<Panel>("catalog");
  const [selectedMaterial, setSelectedMaterial] = useState<PortfolioImage | null>(null);

  const updatePanel = useCallback((p: Panel) => {
    setPanelState(p);
    if (p === "catalog" && window.location.hash === "#works") {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      if (window.location.hash === "#works") setPanelState("materials");
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const openServicePage = (slug: string) => {
    saveLandingScrollForReturn();
    window.location.href = `/services/${slug}`;
  };

  const formatItemPrice = (price: number | null) => {
    if (price === null) return t.servicePage.noPriceLabel;
    return `${price.toLocaleString("ru-RU")} ${t.formatters.currency}`;
  };

  const showTabs = !loadingCategories;

  return (
    <section id="services" className="relative scroll-mt-24 py-20 lg:scroll-mt-28 lg:py-32 bg-navy-light">
      <div className="px-6 lg:px-[6vw]">
        <div className="text-center mb-10 lg:mb-12">
          <h2 className="section-heading font-display text-[clamp(32px,4vw,48px)] text-white mb-4">
            {t.services.sectionTitle}
          </h2>
          <div className="fade-up w-20 h-[2px] bg-gold mx-auto mb-6" />
          <p className="fade-up text-white/70 text-lg max-w-2xl mx-auto">
            {t.services.sectionBody}
          </p>

          {showTabs && (
            <div
              className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-lg border border-white/10 bg-navy/40 p-1"
              role="tablist"
              aria-label={t.services.sectionTitle}
            >
              <button
                type="button"
                role="tab"
                aria-selected={panel === "catalog"}
                onClick={() => updatePanel("catalog")}
                className={`rounded-md px-6 py-2.5 text-sm font-medium uppercase tracking-wider transition-colors ${
                  panel === "catalog"
                    ? "bg-gold/20 text-gold ring-1 ring-gold/50"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                {t.services.catalogTab}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={panel === "materials"}
                onClick={() => updatePanel("materials")}
                className={`rounded-md px-6 py-2.5 text-sm font-medium uppercase tracking-wider transition-colors ${
                  panel === "materials"
                    ? "bg-gold/20 text-gold ring-1 ring-gold/50"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                {t.services.materialsTab}
              </button>
            </div>
          )}
        </div>

        {panel === "catalog" && (
          <>
            {loadingCategories ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-52 rounded-2xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat, idx) => {
                  const gradient = GRADIENT_CLASSES[idx % GRADIENT_CLASSES.length];
                  const name = getCategoryName(cat, lang);
                  const desc = getCategoryDesc(cat, lang);
                  return (
                    <button
                      key={cat.slug}
                      type="button"
                      className="service-card-item group relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl hover:shadow-black/30"
                      onClick={() => openServicePage(cat.slug)}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-gold/0 via-gold/5 to-gold/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="relative z-10 flex min-h-[200px] flex-col p-6">
                        <div className="flex-1">
                          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
                            <span className="font-display text-lg font-bold leading-none text-gold">
                              {(idx + 1).toString().padStart(2, "0")}
                            </span>
                          </div>
                          <h3 className="mb-2 font-display text-xl leading-tight text-white lg:text-2xl">
                            {name}
                          </h3>
                          <p className="line-clamp-2 text-sm leading-relaxed text-white/55">
                            {desc}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                          <span className="text-xs font-medium uppercase tracking-wider text-gold/70">
                            {lang === "ru" ? "Смотреть" : "Ko'rish"}
                          </span>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/20 bg-gold/10 transition-colors group-hover:bg-gold/20">
                            <ChevronRight className="text-gold" size={16} />
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {panel === "materials" && (
          <>
            {loadingPortfolio ? (
              <p className="text-center text-white/70">{t.services.materialsLoading}</p>
            ) : materialImages.length === 0 ? (
              <div className="glass-card rounded-xl border border-white/10 p-10 text-center text-white/70">
                {t.services.materialsEmpty}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {materialImages.map((item: PortfolioImage) => {
                  const name =
                    parseProductName(item.product_name ?? item.title, lang) ||
                    t.servicePage.noName;
                  const cat = item.category ? getCategoryBySlug(item.category) : undefined;
                  const categoryLabel = cat ? getCategoryName(cat, lang) : null;

                  return (
                    <div
                      key={item.id}
                      className="group glass-card flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-2xl hover:shadow-black/45"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedMaterial(item)}
                        className="flex min-h-0 flex-1 cursor-pointer flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#071a2e]"
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
                          {categoryLabel && (
                            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gold/70">
                              {categoryLabel}
                            </p>
                          )}
                          <p className="line-clamp-3 text-sm font-medium leading-relaxed text-white/95">
                            {name}
                          </p>
                          <p className="mt-auto pt-3 text-sm font-semibold tabular-nums tracking-tight text-gold">
                            {formatItemPrice(item.price)}
                          </p>
                        </div>
                      </button>

                      <div className="shrink-0 px-4 pb-4 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedMaterial(item)}
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
          </>
        )}
      </div>

      {selectedMaterial && (
        <OrderModal
          item={selectedMaterial}
          formatPrice={formatItemPrice}
          onClose={() => setSelectedMaterial(null)}
        />
      )}
    </section>
  );
}
